"use server"

import mongoose, { FilterQuery } from "mongoose"
import { revalidatePath } from "next/cache"

import ROUTES from "@/constants/route"
import { Collection, Question } from "@/database"
import { NotFoundError, UnauthorizedError } from "@/lib"
import { dbConnect } from "@/lib/mongoose"
import { ActionResponse, collectionBaseParams, ErrorResponse, PaginatedSearchParams, Question as QuestionType } from "@/types"

import { action, HandleError } from "../handlers"
import { CollectionSchema, GetSavedQuestionsSchema } from "../validation"

export async function hasSavedQuestion(
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

  try {
    await dbConnect()
    const saved = await Collection.exists({ question: questionId, author: userId })

    return { success: true, data: { saved: Boolean(saved) } }
  } catch (error) {
    return HandleError(
      error instanceof Error ? error : new Error(String(error))
    ) as unknown as ErrorResponse
  }
}

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

  // MUST connect to the DB before starting a transaction session
  await dbConnect()

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

    // Revalidate the question page AND the collection page cache
    revalidatePath(ROUTES.QUESTION(questionId))
    revalidatePath("/collection") // Update this string if your route path is different

    return { success: true, data: { saved } }
  } catch (error) {
    return HandleError(
      error instanceof Error ? error : new Error(String(error))
    ) as unknown as ErrorResponse
  } finally {
    await mongoSession.endSession()
  }
}

export async function getSaveQuestions(
  params: PaginatedSearchParams
): Promise<ActionResponse<{
  questions: QuestionType[]
  isNext: boolean
}>> {
  const validationResult = await action({
    params,
    schema: GetSavedQuestionsSchema,
    authorize: true,
  })

  if (validationResult instanceof Error) {
    return HandleError(validationResult) as unknown as ErrorResponse
  }

  const { session: authSession} = validationResult
  const userId = authSession?.user?.id

  if (!userId) {
    return HandleError(new UnauthorizedError()) as unknown as ErrorResponse
  }
 
  const { page = 1, pageSize = 10, query } = validationResult.validatedData;

  const skip = (Number(page) - 1) * pageSize
  const limit = pageSize

  try {
    await dbConnect()

    const collectionQuery: FilterQuery<typeof Collection> = { author: userId }
    
    // Explicitly type the sort object so TS doesn't infer it as { createdAt: number }
    const sortCriteria: Record<string, 1 | -1> = { createdAt: -1 }
    
    // Example for handling filters if needed in the future:
    // if (filter === "oldest") sortCriteria.createdAt = 1
    
    const savedCollections = await Collection.find(collectionQuery)
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit)
      .populate({
        path: "question",
        // Enables searching saved questions by title
        match: query ? { title: { $regex: query, $options: "i" } } : {},
        populate: [
          { path: "author", select: "name image" },
          { path: "tags", select: "name" },
        ],
      })
      .lean()

    // Filter out nulls (questions that didn't match the search query)
    const questions = JSON.parse(
      JSON.stringify(
        savedCollections
          .map((savedCollection) => savedCollection.question)
          .filter(Boolean)
      )
    ) as QuestionType[]
    
    const totalCollections = await Collection.countDocuments(collectionQuery)
    const isNext = totalCollections > skip + savedCollections.length

    return {
      success: true,
      data: {
        questions,
        isNext,
      },
    }
  } catch (error) {
    return HandleError(
      error instanceof Error ? error : new Error(String(error))
    ) as unknown as ErrorResponse
  }
}