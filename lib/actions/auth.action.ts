"use server"

import bcrypt from "bcryptjs"
import mongoose from "mongoose"

import { signIn } from "@/auth"
import { Account, User } from "@/database"
import { action, HandleError, NotFoundError } from "@/lib"
import { SignInSchema, SignUpSchema } from "@/lib/validation"
import { AuthCredentials } from "@/types"

export async function signUpWithCredentials(params: AuthCredentials): Promise<ActionResponse> {
  const validationResult = await action({ params, schema: SignUpSchema })

  if (validationResult instanceof Error) {
    return HandleError(validationResult) as unknown as ErrorResponse
  }

  const { name, username, email, password } = validationResult.validatedData!

  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const existingUser = await User.findOne({ email }).session(session)

    if (existingUser) {
      await session.abortTransaction()
      return HandleError(new Error("User already exists")) as unknown as ErrorResponse
    }

    const existingUsername = await User.findOne({ username }).session(session)

    if (existingUsername) {
      await session.abortTransaction()
      return HandleError(new Error("Username already exists")) as unknown as ErrorResponse
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const [newUser] = await User.create([{ username, name, email }], {
      session
    })

    await Account.create(
      [
        {
          userId: newUser._id,
          name,
          provider: "credentials",
          providerAccountId: email,
          password: hashedPassword
        }
      ],
      { session }
    )

    await session.commitTransaction()

    await signIn("credentials", { email, password, redirect: false })

    return { success: true }
  } catch (error) {
    await session.abortTransaction()
    return HandleError(error as Error) as unknown as ErrorResponse
  } finally {
    await session.endSession()
  }
}

export async function signInWithCredentials(
  params: Pick<AuthCredentials, "email" | "password">
): Promise<ActionResponse> {
  const validationResult = await action({ params, schema: SignInSchema })

  if (validationResult instanceof Error) {
    return HandleError(validationResult) as unknown as ErrorResponse
  }

  const { email, password } = validationResult.validatedData!

  try {
    const existingUser = await User.findOne({ email })

    if (!existingUser) throw new NotFoundError()

    const existingAccount = await Account.findOne({
      provider: "credentials",
      providerAccountId: email
    })

    if (!existingAccount) throw new NotFoundError();

    const passwordMatch = await bcrypt.compare(password, existingAccount.password)

    if (!passwordMatch) {
      return HandleError(new Error("Password does not match")) as unknown as ErrorResponse
    }

    await signIn("credentials", { email, password, redirect: false })

    return { success: true }
  } catch (error) {
    return HandleError(error as Error) as unknown as ErrorResponse
  }
}
