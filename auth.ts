import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

import { User } from "@/database/models/User";
import logger from "@/lib/logger";
import { dbConnect } from "@/lib/mongoose";

export const { handlers, signIn, signOut, auth } = NextAuth({
  // adapter: MongoDBAdapter(mongoClientPromise),
  providers: [
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
    async signIn({ user }) {
      if (!user.email) {
        return true;
      }

      try {
        await dbConnect();

        const existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          const baseUsername = user.email.split("@")[0]?.replace(/[^a-zA-Z0-9_]/g, "") || "user";

          await User.create({
            name: user.name || baseUsername,
            email: user.email,
            image: user.image || "",
            username: baseUsername,
            joinedAt: new Date(),
          });
        }
      } catch (error) {
        logger.error(
          {
            err: error,
            email: user.email,
          },
          "OAuth user sync failed",
        );
      }

      return true;
    },
  },
});
