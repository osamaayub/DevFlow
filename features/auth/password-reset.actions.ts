"use server"

import { createHash, randomBytes } from "node:crypto"

import bcrypt from "bcryptjs"
import mongoose, { Types } from "mongoose"
import { z } from "zod"

import { Account, PasswordResetToken, User } from "@/server/db"
import { dbConnect } from "@/server/db/connect"
import logger from "@/shared/lib/logger"

const emailSchema = z.string().trim().email()
const resetSchema = z.object({
  token: z.string().regex(/^[a-f0-9]{64}$/),
  password: z.string().min(6).max(10)
})

type FlowResult = { success: true } | { success: false; error: string }

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex")

function getEmailConfiguration() {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.AUTH_EMAIL_FROM
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL

  if (!apiKey || !from || !siteUrl) {
    throw new Error("Resend API key, sender address, and site URL must be configured.")
  }

  return { apiKey, from, siteUrl: new URL(siteUrl).origin }
}

async function deliverResetEmail(params: {
  apiKey: string
  from: string
  siteUrl: string
  email: string
  name: string
  token: string
}) {
  const resetUrl = new URL("/reset-password", params.siteUrl)
  resetUrl.searchParams.set("token", params.token)
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: params.from,
      to: [params.email],
      subject: "Reset your DevFlow password",
      text: `Hi ${params.name},\n\nUse this link to reset your DevFlow password. It expires in one hour and can only be used once:\n${resetUrl.toString()}\n\nIf you did not request this, you can ignore this email.`,
      html: `<p>Hi ${escapeHtml(params.name)},</p><p>Use this link to reset your DevFlow password. It expires in one hour and can only be used once.</p><p><a href="${resetUrl.toString()}">Reset password</a></p><p>If you did not request this, you can ignore this email.</p>`
    })
  })

  if (!response.ok) {
    const responseBody = await response.text()
    logger.error(
      { status: response.status, response: responseBody },
      "Resend rejected a password reset email"
    )
    throw new Error("Email delivery failed.")
  }
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }
    return entities[character]
  })
}

export async function requestPasswordReset(value: string): Promise<FlowResult> {
  const parsedEmail = emailSchema.safeParse(value)
  if (!parsedEmail.success) {
    return { success: false, error: "Please enter a valid email address." }
  }

  let emailConfig: ReturnType<typeof getEmailConfiguration>
  try {
    emailConfig = getEmailConfiguration()
    await dbConnect()
    const normalizedEmail = parsedEmail.data.toLowerCase()
    const emailPattern = new RegExp(
      `^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
      "i"
    )
    const user = (await User.findOne({ email: emailPattern })
      .select("_id email name")
      .lean()) as { _id: Types.ObjectId; email: string; name: string } | null

    if (!user) {
      logger.info("Skipped password reset email because no matching user was found")
      return { success: true }
    }

    const token = randomBytes(32).toString("hex")
    const tokenHash = hashToken(token)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)
    await PasswordResetToken.deleteMany({ userId: user._id })
    await PasswordResetToken.create({ tokenHash, userId: user._id, expiresAt })

    try {
      await deliverResetEmail({
        ...emailConfig,
        email: user.email,
        name: user.name,
        token
      })
      logger.info("Resend accepted a password reset email")
    } catch (error) {
      await PasswordResetToken.deleteOne({ tokenHash })
      throw error
    }

    return { success: true }
  } catch (error) {
    logger.error({ err: error }, "Failed to process a password reset request")
    return {
      success: false,
      error: "Password reset email is unavailable right now. Please try again later."
    }
  }
}

export async function resetPassword(token: string, password: string): Promise<FlowResult> {
  const parsed = resetSchema.safeParse({ token, password })
  if (!parsed.success) {
    return { success: false, error: "The reset link or password is invalid." }
  }

  let result: FlowResult = {
    success: false,
    error: "Unable to reset your password. Please try again."
  }
  const session = await mongoose.startSession()

  try {
    await dbConnect()
    await session.withTransaction(async () => {
      const tokenHash = hashToken(parsed.data.token)
      const resetRecord = (await PasswordResetToken.findOne({
        tokenHash,
        expiresAt: { $gt: new Date() }
      })
        .select("userId")
        .session(session)
        .lean()) as { userId: Types.ObjectId } | null

      if (!resetRecord) {
        result = { success: false, error: "This reset link has expired or has already been used." }
        return
      }

      const user = (await User.findById(resetRecord.userId)
        .select("email name")
        .session(session)
        .lean()) as { email: string; name: string } | null
      if (!user) {
        result = { success: false, error: "This account could not be found. Request a new link." }
        return
      }

      const passwordHash = await bcrypt.hash(parsed.data.password, 12)
      const consumedToken = await PasswordResetToken.findOneAndDelete({
        tokenHash,
        expiresAt: { $gt: new Date() }
      }).session(session)
      if (!consumedToken) {
        result = { success: false, error: "This reset link has expired or has already been used." }
        return
      }

      const email = user.email.trim().toLowerCase()
      const updateResult = await Account.updateOne(
        { userId: resetRecord.userId, provider: "credentials" },
        {
          $set: { name: user.name, password: passwordHash, providerAccountId: email },
          $setOnInsert: {
            userId: resetRecord.userId,
            provider: "credentials"
          }
        },
        { upsert: true, session }
      )
      if (updateResult.matchedCount + updateResult.upsertedCount !== 1) {
        logger.error({ userId: resetRecord.userId.toString() }, "Password reset account disappeared")
        throw new Error("Password reset account update failed.")
      }

      await PasswordResetToken.deleteMany({ userId: resetRecord.userId }).session(session)
      result = { success: true }
    })

    return result
  } catch (error) {
    logger.error({ err: error }, "Failed to reset a DevFlow password")
    return { success: false, error: "Unable to reset your password. Please try again." }
  } finally {
    await session.endSession()
  }
}
