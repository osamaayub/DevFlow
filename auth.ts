import bcrypt from "bcryptjs"
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"

// Adjust these imports to match your project's exact folder structure
import { Account, User } from "@/database"
import { dbConnect } from "@/lib/mongoose"

export const { handlers, signIn, auth } = NextAuth({
  providers: [
    GitHub,
    Google,
    Credentials({
      async authorize(credentials) {
        // 1. Extract credentials directly (bypassing Zod here since the Server Action already validated it)
        const email = credentials?.email as string
        const password = credentials?.password as string

        if (!email || !password) {
          console.log("❌ NextAuth Error: Missing credentials")
          return null
        }

        try {
          // 2. Connect directly to the database
          await dbConnect()

          // 3. Query the DB directly
          const existingAccount = (await Account.findOne({
            provider: "credentials",
            providerAccountId: email
          }).lean()) as { userId: string; password?: string } | null

          if (!existingAccount || !existingAccount.password) {
            console.log("❌ NextAuth Error: Account not found")
            return null
          }

          const existingUser = (await User.findById(existingAccount.userId).lean()) as {
            _id: string
            name: string
            email: string
            image?: string
          } | null

          if (!existingUser) {
            console.log("❌ NextAuth Error: User not found")
            return null
          }

          const isValidPassword = await bcrypt.compare(password, existingAccount.password)

          if (!isValidPassword) {
            console.log("❌ NextAuth Error: Invalid password")
            return null
          }

          // 4. Success! Return the user object
          return {
            id: existingUser._id.toString(),
            name: existingUser.name,
            email: existingUser.email,
            image: existingUser.image
          }
        } catch (error) {
          console.error("❌ NextAuth authorize error:", error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub
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
            : { providerAccountId: providerId }
        ).lean()) as { userId: string } | null

        if (!existingAccount) return token

        if (existingAccount.userId) {
          token.sub = existingAccount.userId.toString()
        }
      }

      return token
    },
    async signIn({ user, profile, account }) {
      // Credentials login is already handled by the authorize function
      if (account?.type === "credentials") return true
      if (!account || !user) return false

      // Ensure DB is connected for OAuth handling
      await dbConnect()

      const userInfo = {
        name: user.name || "No Name",
        email: user.email || "",
        image: user.image || "",
        username:
          account.provider === "github"
            ? (profile?.login as string)
            : (user.name?.toLowerCase().replace(/\s/g, "") as string)
      }

      try {
        // 1. Check if the user exists, if not, create them
        let existingUser = await User.findOne({ email: userInfo.email })

        if (!existingUser) {
          existingUser = await User.create({
            name: userInfo.name,
            email: userInfo.email,
            username: userInfo.username,
            image: userInfo.image
          })
        }

        // 2. Check if the OAuth account is linked, if not, create it
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
            email: userInfo.email
          })
        }

        return true
      } catch (error) {
        console.error("❌ OAuth SignIn Error:", error)
        return false
      }
    }
  }
})
