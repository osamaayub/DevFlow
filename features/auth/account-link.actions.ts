"use server"

import { createHash, randomBytes } from "node:crypto"

import bcrypt from "bcryptjs"
import { Types } from "mongoose"
import { cookies } from "next/headers"
import { z } from "zod"

import { Account, AccountLinkIntent, User } from "@/server/db"
import { dbConnect } from "@/server/db/connect"
import logger from "@/shared/lib/logger"
import { SignInSchema } from "@/shared/lib/validation"

const accountLinkSchema = SignInSchema.extend({
  provider: z.enum(["google", "github"])
})

type FlowResult = { success: true } | { success: false; error: string }

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex")
const ACCOUNT_LINK_COOKIE = "devflow-account-link"
const INTENT_LIFETIME_MS = 5 * 60 * 1000

export async function createAccountLinkIntent(
  input: z.infer<typeof accountLinkSchema>
): Promise<FlowResult> {
  const parsed = accountLinkSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: "Enter a valid email address and password." }
  }

  try {
    await dbConnect()
    const user = (await User.findOne({ email: parsed.data.email }).select("_id").lean()) as {
      _id: Types.ObjectId
    } | null
    if (!user) {
      return { success: false, error: "Email or password is incorrect." }
    }

    const account = (await Account.findOne({
      userId: user._id,
      provider: "credentials"
    })
      .select("password")
      .lean()) as { password?: string } | null

    if (!account?.password || !(await bcrypt.compare(parsed.data.password, account.password))) {
      return { success: false, error: "Email or password is incorrect." }
    }

    const token = randomBytes(32).toString("hex")
    const tokenHash = hashToken(token)
    const expiresAt = new Date(Date.now() + INTENT_LIFETIME_MS)

    await AccountLinkIntent.deleteMany({ userId: user._id, provider: parsed.data.provider })
    await AccountLinkIntent.create({
      tokenHash,
      userId: user._id,
      email: parsed.data.email,
      provider: parsed.data.provider,
      expiresAt
    })

    const cookieStore = await cookies()
    cookieStore.set(ACCOUNT_LINK_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/auth",
      expires: expiresAt
    })

    return { success: true }
  } catch (error) {
    logger.error({ err: error }, "Failed to authorize an OAuth account link")
    return { success: false, error: "Unable to verify your account. Please try again." }
  }
}
