import bcrypt from "bcryptjs"
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"

import { Account, User } from "@/database"
import logger from "@/lib/logger"
import { dbConnect } from "@/lib/mongoose"

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

export const { handlers, signIn, signOut, auth } = NextAuth({
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
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = String(token.sub)
      }
      return session
    },
    async jwt({ token, account }) {
      if (account) {
        await dbConnect()

        const providerId = account.type === "credentials" ? token.email! : account.providerAccountId

        const existingAccount = (await Account.findOne(
          account.type === "credentials"
            ? { provider: "credentials", providerAccountId: providerId }
            : { provider: account.provider, providerAccountId: providerId }
        ).lean()) as { userId: string } | null

        if (!existingAccount) return token

        if (existingAccount.userId) {
          token.sub = existingAccount.userId.toString()
        }
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
        let existingUser = await User.findOne({ email: userInfo.email })

        if (!existingUser) {
          existingUser = await User.create({
            name: userInfo.name,
            email: userInfo.email,
            username: userInfo.username,
            image: userInfo.image
          })
        }

        const existingAccount = await Account.findOne({
          provider: account.provider,
          providerAccountId: account.providerAccountId
        })

        if (!existingAccount) {
          await Account.create({
            userId: existingUser._id,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            name: userInfo.name,
            image: userInfo.image
          })
        }

        return true
      } catch (error) {
        logger.error(`❌ OAuth SignIn Error: ${error}`)
        return false
      }
    }
  }
})
