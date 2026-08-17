"use server";

import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { AuthError } from "next-auth";

import { signIn } from "@/auth";
import { Account, User } from "@/database";
import { action, NotFoundError, RequestError } from "@/lib"; // Removed HandleError completely for Server Actions
import { SignInSchema, SignUpSchema } from "@/lib/validation";
import { AuthCredentials } from "@/types";

// ✅ Accepts 'unknown' directly from catch blocks
function formatActionError(error: unknown): ActionResponse {
  if (error instanceof RequestError) {
    return {
      success: false,
      status: error.statusCode,
      error: {
        message: error.message,
        details: error.error, // Extracts the Zod field errors safely
      },
    };
  }

  return {
    success: false,
    status: 500,
    error: {
      message: error instanceof Error ? error.message : "An unexpected error occurred",
    },
  };
}

export async function signUpWithCredentials(
  params: AuthCredentials
): Promise<ActionResponse> {
  const validationResult = await action({ params, schema: SignUpSchema });

  if (validationResult instanceof Error) {
    return formatActionError(validationResult);
  }

  const { name, username, email, password } = validationResult.validatedData;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingUser = await User.findOne({ email }).session(session).lean() as { _id: unknown } | null;
    if (existingUser) {
      await session.abortTransaction();
      return formatActionError(new RequestError("User already exists", 409));
    }

    const existingUsername = await User.findOne({ username }).session(session).lean() as { _id: unknown } | null;
    if (existingUsername) {
      await session.abortTransaction();
      return formatActionError(new RequestError("Username already exists", 409));
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const [newUser] = await User.create([{ username, name, email }], { session });

    await Account.create(
      [
        {
          userId: newUser._id,
          name,
          provider: "credentials",
          providerAccountId: email,
          password: hashedPassword,
        },
      ],
      { session }
    );

    await session.commitTransaction();
  } catch (error: unknown) { // ✅ Explicitly typed as unknown
    await session.abortTransaction();
    return formatActionError(error);
  } finally {
    await session.endSession();
  }

  try {
    await signIn("credentials", { email, password, redirect: true });
    return { success: true };
  } catch (error: unknown) { // ✅ Explicitly typed as unknown
    if (error instanceof AuthError) {
      return formatActionError(new RequestError("Authentication failed", 401));
    }
    // Re-throw redirect errors back to Next.js so it can navigate the user
    throw error; 
  }
}

export async function signInWithCredentials(
  params: Pick<AuthCredentials, "email" | "password">
): Promise<ActionResponse> {
  const validationResult = await action({ params, schema: SignInSchema });

  if (validationResult instanceof Error) {
    return formatActionError(validationResult);
  }

  const { email, password } = validationResult.validatedData;

  try {
    const existingUser = await User.findOne({ email }).lean() as { _id: unknown } | null;
    if (!existingUser) {
      return formatActionError(new NotFoundError({ user: ["User not found"] }));
    }

    const existingAccount = await Account.findOne({
      provider: "credentials",
      providerAccountId: email,
    }).lean() as { password?: string } | null;

    if (!existingAccount || !existingAccount.password) {
      return formatActionError(new NotFoundError({ account: ["Account not found"] }));
    }

    const passwordMatch = await bcrypt.compare(password, existingAccount.password);
    if (!passwordMatch) {
      return formatActionError(new RequestError("Password does not match", 401));
    }
  } catch (error: unknown) { // ✅ Explicitly typed as unknown
    return formatActionError(error);
  }

  try {
    await signIn("credentials", { email, password, redirect: false });
    return { success: true };
  } catch (error: unknown) { // ✅ Explicitly typed as unknown
    if (error instanceof AuthError) {
      return formatActionError(new RequestError("Authentication failed", 401));
    }
    // Re-throw redirect errors back to Next.js
    throw error; 
  }
}