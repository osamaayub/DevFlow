import { Types } from "mongoose";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

import { User } from "@/database/models/User";
import type { IUser } from "@/database/models/User";
import { accountsApi, authApi } from "@/lib/api";
import logger from "@/lib/logger";
import { dbConnect } from "@/lib/mongoose";
import slugify from "slugify";

export const { handlers, signIn, signOut, auth } = NextAuth({
  // adapter: MongoDBAdapter(mongoClientPromise),
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toString();
        const password = credentials?.password?.toString();

        if (!email || !password) {
          return null;
        }

        try {
          await dbConnect();
          const user = (await User.findOne({ email })) as (IUser & { _id: Types.ObjectId }) | null;

          if (!user || user.password !== password) {
            return null;
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            image: user.image || "",
            username: user.username,
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          logger.error(
            {
              err: error,
              message: errorMessage,
              email,
            },
            "Credentials sign-in failed during user lookup",
          );
          return null;
        }
      },
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID || "",
      clientSecret: process.env.AUTH_GITHUB_SECRET || "",
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || "",
    }),
  ],
  secret: process.env.AUTH_SECRET,
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) {
        return true;
      }

      const providerName = account?.provider;
      const providerType = account?.type;
      const isCredentials = providerType === "credentials" || providerName === "credentials";
      const isOAuth =
        providerType === "oauth" ||
        providerName === "github" ||
        providerName === "google";

      try {
        await dbConnect();

        if (isOAuth && providerName && account?.providerAccountId) {
          const baseUsername =
            user.image ||
            user.name ||
            user.email.split("@")[0]?.replace(/[^a-zA-Z0-9_]/g, "") ||
            "user";
          const sluggedUsername = slugify(String(baseUsername), {
            lower: true,
            strict: true,
            trim: true,
          });

          await authApi.signInOauth({
            provider: providerName,
            providerAccountId: account.providerAccountId,
            user: {
              name: user.name || baseUsername,
              username: sluggedUsername,
              email: user.email,
              image: user.image || "",
            },
            image: user.image || "",
          });
        }

        if (isCredentials) {
          const existingUser = await User.findOne({ email: user.email });
          if (!existingUser) {
            logger.warn(
              {
                email: user.email,
              },
              "Credentials sign-in succeeded for user that does not exist in DB",
            );
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(
          {
            err: error,
            message: errorMessage,
            email: user.email,
            provider: account?.provider,
            providerAccountId: account?.providerAccountId,
          },
          "OAuth sign-in synchronization failed while syncing user account",
        );
      }

      return true;
    },

    async jwt({ token, account }) {
      if (account?.providerAccountId) {
        try {
          const providerAccount = await accountsApi.getByProviderAccountId(account.providerAccountId);
          token.provider = providerAccount.provider || account.provider || token.provider;
          token.userId = providerAccount.userId || token.userId;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          logger.error(
            {
              err: error,
              message: errorMessage,
              providerAccountId: account.providerAccountId,
              provider: account.provider,
            },
            "Unable to resolve OAuth account from providerAccountId during JWT callback",
          );
          token.provider = account.provider || token.provider;
        }
      }
      return token;
    },

    async session({ session, token }) {
      const customToken = token as any;
      if (session.user) {
        session.user.id = customToken.id || session.user.id;
        session.user.name = customToken.name || (session.user as any).name;
        session.user.email = customToken.email || session.user.email;
        session.user.image = customToken.picture || session.user.image;
        (session.user as any).provider = customToken.provider || (session.user as any).provider;
      }
      return session;
    },
  },
});
