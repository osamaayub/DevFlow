"use server"

import mongoose from "mongoose"
import { revalidatePath } from "next/cache"

import ROUTES from "@/constants/route"
import { Collection, Question } from "@/database"
import { NotFoundError, UnauthorizedError } from "@/lib"
import { ActionResponse, collectionBaseParams, ErrorResponse } from "@/types"

import { action, HandleError } from "../handlers"
import { CollectionSchema } from "../validation"

export async function toggleSaveQuestion(
  params: collectionBaseParams
): Promise<ActionResponse<{ saved: boolean }>> {
  const validationResult = await action({
    params,
    schema: CollectionSchema,
    authorize: true,
  })

  if (validationResult instanceof Error) {
    return HandleError(validationResult) as unknown as ErrorResponse
  }

  const { validatedData, session: authSession } = validationResult
  const { questionId } = validatedData
  const userId = authSession?.user?.id

  if (!userId) {
    return HandleError(new UnauthorizedError()) as unknown as ErrorResponse
  }

  const mongoSession = await mongoose.startSession()

  try {
    const questionExists = await Question.exists({ _id: questionId })
    if (!questionExists) throw new NotFoundError()

    let saved = false

    await mongoSession.withTransaction(async () => {
      const removed = await Collection.findOneAndDelete(
        { question: questionId, author: userId },
        { session: mongoSession }
      )

      if (removed) {
        saved = false
        return
      }

      await Collection.create(
        [{ question: questionId, author: userId }],
        { session: mongoSession }
      )
      saved = true
    })

    revalidatePath(ROUTES.QUESTION(questionId))

    return { success: true, data: { saved } }
  } catch (error) {
    return HandleError(
      error instanceof Error ? error : new Error(String(error))
    ) as unknown as ErrorResponse
  } finally {
    await mongoSession.endSession()
  }
}