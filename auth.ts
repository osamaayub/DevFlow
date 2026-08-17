import bcrypt from "bcryptjs"
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"

import { SignInSchema, api } from "@/lib"

export const { handlers, signIn, auth } = NextAuth({
  providers: [
    GitHub,
    Google,
    Credentials({
      async authorize(credentials) {
        const validatedFields = SignInSchema.safeParse(credentials)

        if (validatedFields.success) {
          const { email, password } = validatedFields.data

          const existingAccount = await api.accounts.getByEmail(email)

          if (!existingAccount || !existingAccount.password) return null

          const existingUser = await api.users.getById(existingAccount.userId.toString())

          if (!existingUser) return null

          const isValidPassword = await bcrypt.compare(password, existingAccount.password)

          if (isValidPassword) {
            return {
              id: existingUser._id, // FIX 3: Mapped _id from UserDto to id
              name: existingUser.name,
              email: existingUser.email,
              image: existingUser.image
            }
          }
        }
        return null
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
        // FIX 4: Determine the correct lookup strategy based on account type
        const providerId = account.type === "credentials" ? token.email! : account.providerAccountId

        const existingAccount =
          account.type === "credentials"
            ? await api.accounts.getByEmail(providerId)
            : await api.accounts.getByProviderAccountId(providerId)

        if (!existingAccount) return token

        const userId = existingAccount.userId

        if (userId) token.sub = userId.toString()
      }

      return token
    },
    async signIn({ user, profile, account }) {
      if (account?.type === "credentials") return true
      if (!account || !user) return false

      const userInfo = {
        name: user.name!,
        email: user.email!,
        image: user.image!,
        username:
          account.provider === "github"
            ? (profile?.login as string)
            : (user.name?.toLowerCase().replace(/\s/g, "") as string) // FIX: Removed spaces for Google usernames
      }

      // FIX 5: Use correct signInOauth method name and drop { success } destructuring
      const result = await api.auth.signInOauth({
        user: userInfo,
        provider: account.provider as "github" | "google",
        providerAccountId: account.providerAccountId
      })

      // If the API call returns data, signIn was successful
      return !!result
    }
  }
})
