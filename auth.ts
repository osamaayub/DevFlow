import bcrypt from "bcryptjs"
import NextAuth from "next-auth"
import type { User as NextAuthUser } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"

import { IUser, IAccount } from "@/database"
import { api } from "@/lib"
import logger from "@/lib/logger"
import { SignInSchema } from "@/lib/validation"

// Constants
const OAUTH_PROVIDERS = ["github", "google"] as const
type OAuthProvider = (typeof OAUTH_PROVIDERS)[number]

const isValidOAuthProvider = (provider: string): provider is OAuthProvider => {
  return OAUTH_PROVIDERS.includes(provider as OAuthProvider)
}

const getOAuthAccount = async (providerAccountId: string): Promise<IAccount | null> => {
  try {
    const account = await api.accounts.getByProviderAccountId(providerAccountId)

    if (!account) {
      logger.warn({ providerAccountId }, "OAuth account not found")
      return null
    }

    return account as unknown as IAccount
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger.error({ error, providerAccountId }, `Failed to retrieve OAuth account: ${errorMessage}`)
    return null
  }
}

/**
 * Safe credentials account lookup by email
 */
const getCredentialsAccount = async (email: string): Promise<IAccount | null> => {
  try {
    const account = await api.accounts.getByEmail(email)

    if (!account) {
      logger.info({ email }, "Credentials account not found")
      return null
    }

    return account as unknown as IAccount
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger.error({ error, email }, `Failed to retrieve credentials account: ${errorMessage}`)
    return null
  }
}

/**
 * Safe user lookup
 */
const getUser = async (userId: string): Promise<IUser | null> => {
  try {
    const user = await api.users.getById(userId)

    if (!user) {
      logger.warn({ userId }, "User not found")
      return null
    }

    return user as unknown as IUser
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger.error({ error, userId }, `Failed to retrieve user: ${errorMessage}`)
    return null
  }
}

/**
 * Safe OAuth sign-in
 */
const performOAuthSignIn = async (
  provider: OAuthProvider,
  providerAccountId: string,
  userInfo: {
    name: string
    email: string
    image: string
    username: string
  }
): Promise<boolean> => {
  try {
    // ✅ FIXED: Using api.auth cleanly without 'any' overrides
    const user = await api.auth.signInOauth({
      provider,
      providerAccountId,
      user: userInfo,
      image: userInfo.image
    })

    if (!user) {
      logger.warn(
        { provider, providerAccountId, email: userInfo.email },
        "OAuth sign-in API call failed"
      )
      return false
    }

    logger.info({ provider, email: userInfo.email }, "OAuth sign-in successful")
    return true
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger.error(
      { error, provider, providerAccountId, email: userInfo.email },
      `OAuth sign-in failed: ${errorMessage}`
    )
    return false
  }
}

/**
 * Generate username from various sources
 */
const generateUsername = (
  provider: OAuthProvider,
  profile?: Record<string, unknown>,
  userName?: string | null,
  userEmail?: string | null
): string => {
  let username: string

  if (provider === "github" && profile?.login) {
    username = String(profile.login)
  } else if (userName) {
    username = userName.toLowerCase().replace(/\s+/g, "-")
  } else if (userEmail) {
    username = userEmail.split("@")[0]
  } else {
    username = `user-${Date.now()}`
  }

  return username
    .replace(/[^a-z0-9-_]/g, "")
    .substring(0, 30)
    .replace(/^-+|-+$/g, "")
}

export const { handlers, signIn, auth } = NextAuth({
  providers: [
    GitHub({
      allowDangerousEmailAccountLinking: false
    }),
    Google({
      allowDangerousEmailAccountLinking: false
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials) {
          logger.warn("Credentials sign-in attempted with missing credentials")
          return null
        }

        const validatedFields = SignInSchema.safeParse(credentials)

        if (!validatedFields.success) {
          logger.warn(
            { errors: validatedFields.error.flatten().fieldErrors },
            "Credentials validation failed"
          )
          return null
        }

        const { email, password } = validatedFields.data

        try {
          const user = (await api.users.getByEmail(email)) as unknown as IUser | undefined

          if (!user) {
            logger.info({ email }, "User not found for credentials sign-in")
            return null
          }

          if (!user.password) {
            logger.warn({ email }, "User has no password hash")
            return null
          }

          const isValidPassword = await bcrypt.compare(password, user.password)

          if (!isValidPassword) {
            logger.warn({ email }, "Invalid password for credentials sign-in")
            return null
          }

          logger.info({ email }, "Credentials sign-in successful")

          return {
            id: String(user._id ?? ""),
            name: user.name ?? null,
            email: user.email ?? null,
            image: user.image ?? null
          } as NextAuthUser
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error)
          logger.error({ error, email }, `Credentials authorize failed: ${errorMessage}`)
          return null
        }
      }
    })
  ],
  pages: {
    signIn: "/sign-in",
    error: "/auth/error"
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.type === "credentials") {
        return true
      }

      if (!account || !user || !user.email) {
        logger.warn({ provider: account?.provider }, "OAuth sign-in rejected: missing data")
        return false
      }

      if (!isValidOAuthProvider(account.provider)) {
        logger.error({ provider: account.provider }, "Unsupported OAuth provider")
        return false
      }

      const provider = account.provider as OAuthProvider

      try {
        const username = generateUsername(provider, profile, user.name, user.email)

        const userInfo = {
          name: user.name ?? username,
          email: user.email,
          image: user.image ?? "",
          username
        }

        return await performOAuthSignIn(provider, account.providerAccountId, userInfo)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        logger.error(
          { error, provider: account.provider, email: user.email },
          `signIn callback failed: ${errorMessage}`
        )
        return false
      }
    },

    async jwt({ token, account }) {
      if (account) {
        try {
          let accountData: IAccount | null = null

          if (account.type === "credentials") {
            accountData = await getCredentialsAccount(token.email ?? "")
          } else {
            accountData = await getOAuthAccount(account.providerAccountId)
          }

          if (accountData?.userId) {
            token.sub = accountData.userId.toString()
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error)
          logger.error(
            { error, provider: account.provider },
            `JWT callback failed: ${errorMessage}`
          )
        }
      }

      return token
    },

    async session({ session, token }) {
      if (!session.user || !token.sub) {
        logger.warn("Session callback: missing user or token.sub")
        return session
      }

      try {
        const user = await getUser(token.sub)

        if (user) {
          session.user = {
            ...session.user,
            id: String(user._id ?? token.sub),
            name: user.name ?? null,
            email: user.email ?? null,
            image: user.image ?? null,
            emailVerified: null
          } as typeof session.user // ✅ FIXED: Casts cleanly to what the session callback demands
        } else {
          logger.warn({ userId: token.sub }, "User not found in session callback")
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        logger.error({ error, userId: token.sub }, `Session callback failed: ${errorMessage}`)
      }

      return session
    }
  }
})
