"use server"

import { Session } from "next-auth"
import { ZodError } from "zod"

import { auth } from "@/auth"
import { dbConnect, UnauthorizedError, ValidationError } from "@/lib"
import { ActionOptions } from "@/types"

export async function action({ schema, params, authorize = false }: ActionOptions<T>) {
  try {
    if (schema && params) {
      const validatedData = schema.parse(params)

      let session: Session | null = null
      if (authorize) {
        session = await auth()
        if (!session) {
          return new UnauthorizedError()
        }
      }

      await dbConnect()

      return { session, validatedData }
    }
  } catch (e: unknown) {
    if (e instanceof ZodError) {
      return new ValidationError(e.flatten().fieldErrors as Record<string, string[]>)
    } else if (e instanceof Error) {
      return new Error(e.message)
    }
  }
}
