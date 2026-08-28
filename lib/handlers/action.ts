"use server"

import { Session } from "next-auth"
import { ZodError } from "zod"

import { auth } from "@/auth"
import { dbConnect } from "@/lib/mongoose"
import { UnauthorizedError, ValidationError } from "@/lib"
import { ActionOptions } from "@/types"

type ActionResult<T> =
  | {
      session: Session | null
      validatedData: T
    }
  | Error

export async function action<T>({
  schema,
  params,
  authorize = false
}: ActionOptions<T>): Promise<ActionResult<T>> {
  try {
    if (!schema || !params) {
      return new Error("Schema and params are required")
    }

    const validatedData = schema.parse(params)

    let session: Session | null = null

    if (authorize) {
      session = await auth()

      if (!session) {
        return new UnauthorizedError()
      }
    }

    await dbConnect()

    return {
      session,
      validatedData
    }
  } catch (e: unknown) {
    if (e instanceof ZodError) {
      return new ValidationError(e.flatten().fieldErrors as Record<string, string[]>)
    }

    if (e instanceof Error) {
      return new Error(e.message)
    }

    return new Error("Something went wrong")
  }
}
