import bcrypt from "bcryptjs"
import type { Types } from "mongoose"
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import { cache } from "react"

import { Account, User } from "@/server/db"
import { dbConnect } from "@/server/db/connect"
import { deferToRequestTime } from "@/server/request-time"
import logger from "@/shared/lib/logger"

function buildOAuthUsername(
  provider: string,
  profile: Record<string, unknown> | undefined,
  name: string,
  email: string,
  providerAccountId: string
) {
  if (provider === "github" && typeof profile?.login === "string") {
    return profile.login
  }

  const fromName = name.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9._-]/g, "")
  if (fromName) return fromName

  const fromEmail = email.split("@")[0]?.toLowerCase().replace(/[^a-z0-9._-]/g, "")
  if (fromEmail) return fromEmail

  return `${provider}_${providerAccountId}`.slice(0, 30)
}

const nextAuth = NextAuth({
  trustHost: true,
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET
    }),
    Credentials({
      async authorize(credentials) {
        const email = credentials?.email as string
        const password = credentials?.password as string

        if (!email || !password) {
          logger.error("❌ NextAuth Error: Missing credentials")
          return null
        }

        try {
          await dbConnect()

          const existingAccount = (await Account.findOne({
            provider: "credentials",
            providerAccountId: email
          }).lean()) as { userId: string; password?: string } | null

          if (!existingAccount || !existingAccount.password) {
            logger.info("❌ NextAuth Error: Account not found")
            return null
          }

          const existingUser = (await User.findById(existingAccount.userId).lean()) as {
            _id: string
            name: string
            email: string
            image?: string
          } | null

          if (!existingUser) {
            logger.error("❌ NextAuth Error: User not found")
            return null
          }

          const isValidPassword = await bcrypt.compare(password, existingAccount.password)

          if (!isValidPassword) {
            logger.error("❌ NextAuth Error: Invalid password")
            return null
          }

          return {
            id: existingUser._id.toString(),
            name: existingUser.name,
            email: existingUser.email,
            image: existingUser.image
          }
        } catch (error) {
          logger.error(`❌ NextAuth authorize error: ${error}`)
          return null
        }
      }
    })
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      // OAuth providers can return an absolute callback URL. Only allow URLs
      // on this app to prevent an open redirect after sign-in.
      if (url.startsWith("/")) return `${baseUrl}${url}`
      if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = String(token.sub)
      }
      return session
    },
    async jwt({ token, user }) {
      // `user` is only present on sign-in. Credentials authorize() returns the DevFlow user id,
      // and the OAuth signIn callback below writes it onto the same object, so no lookup is needed.
      if (user?.id) {
        token.sub = user.id
      }

      return token
    },
    async signIn({ user, profile, account }) {
      if (account?.type === "credentials") return true
      if (!account || !user) return false

      const email = user.email?.trim()
      if (!email) {
        logger.error("❌ OAuth SignIn Error: Provider did not return an email")
        return false
      }

      await dbConnect()

      const name = user.name?.trim() || email.split("@")[0] || "User"
      const userInfo = {
        name,
        email,
        image: user.image || "",
        username: buildOAuthUsername(
          account.provider,
          profile as Record<string, unknown> | undefined,
          name,
          email,
          account.providerAccountId
        )
      }

      try {
        // Both lookups are independent, so run them together (one round trip instead of two)
        const [existingAccount, existingUser] = await Promise.all([
          Account.findOne({
            provider: account.provider,
            providerAccountId: account.providerAccountId
          })
            .select("userId")
            .lean<{ userId: Types.ObjectId } | null>(),
          User.findOne({ email: userInfo.email }).select("_id").lean<{ _id: Types.ObjectId } | null>()
        ])

        // A linked account is authoritative, then a user with this email, else a new user
        const userId: Types.ObjectId =
          existingAccount?.userId ??
          existingUser?._id ??
          (
            await User.create({
              name: userInfo.name,
              email: userInfo.email,
              username: userInfo.username,
              image: userInfo.image
            })
          )._id

        if (!existingAccount) {
          await Account.create({
            userId,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            name: userInfo.name,
            image: userInfo.image
          })
        }

        // Auth.js passes this same object to the jwt callback, which stores it as token.sub
        user.id = userId.toString()

        return true
      } catch (error) {
        logger.error(`❌ OAuth SignIn Error: ${error}`)
        return false
      }
    }
  }
})

export const { handlers, signIn, signOut } = nextAuth

/**
 * Session for the current request. The root layout, navbar, left sidebar and page all ask
 * for it; React's cache() makes them share one decode per request instead of one each.
 */
export const auth = cache(async () => {
  // Reading the session can re-encrypt the cookie (random IV), which a prefetch render
  // rejects, so session reads only run while serving a real request
  await deferToRequestTime()
  return nextAuth.auth()
})
