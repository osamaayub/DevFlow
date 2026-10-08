"use server"

import mongoose from "mongoose"
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
  tags: string[]
}>> {
  const validationResult = await action({
    params,
    schema: GetSavedQuestionsSchema,
    authorize: true,
  })

  if (validationResult instanceof Error) {
    return HandleError(validationResult) as unknown as ErrorResponse
  }

  const { session: authSession } = validationResult
  const userId = authSession?.user?.id

  if (!userId) {
    return HandleError(new UnauthorizedError()) as unknown as ErrorResponse
  }

  const { page = 1, pageSize = 10, query, filter, tag } = validationResult.validatedData;

  const skip = (Number(page) - 1) * pageSize
  const limit = pageSize
  let sortCriteria: Record<string, 1 | -1> = { "question.createdAt": -1 }

  switch (filter) {
    case "oldest":
      sortCriteria = { "question.createdAt": 1 }
      break
    case "mostvoted":
    case "popular":
      sortCriteria = { "question.upvotes": -1 }
      break
    case "mostviewed":
      sortCriteria = { "question.views": -1 }
      break
    case "mostanswered":
      sortCriteria = { "question.answers": -1 }
      break
    case "mostrecent":
    case "newest":
    case "unanswered":
      sortCriteria = { "question.createdAt": -1 }
      break
  }

  try {
    await dbConnect()

    const savedTags = await Collection.aggregate([
      { $match: { author: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: "questions",
          localField: "question",
          foreignField: "_id",
          as: "question",
        },
      },
      { $unwind: "$question" },
      {
        $lookup: {
          from: "tags",
          let: { tagIds: "$question.tags" },
          pipeline: [
            { $match: { $expr: { $in: ["$_id", "$$tagIds"] } } },
            { $project: { name: 1 } },
          ],
          as: "tags",
        },
      },
      { $unwind: "$tags" },
      { $group: { _id: "$tags.name" } },
      { $sort: { _id: 1 } },
    ])

    const pipeline: mongoose.PipelineStage[] = [
      { $match: { author: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: "questions",
          localField: "question",
          foreignField: "_id",
          as: "question",
        },
      },
      { $unwind: "$question" },
      {
        $lookup: {
          from: "tags",
          let: { tagIds: "$question.tags" },
          pipeline: [
            { $match: { $expr: { $in: ["$_id", "$$tagIds"] } } },
            { $project: { _id: 1, name: 1 } },
          ],
          as: "question.tags",
        },
      },
      {
        $lookup: {
          from: "users",
          let: { authorId: "$question.author" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$authorId"] } } },
            { $project: { _id: 1, name: 1, image: 1 } },
          ],
          as: "question.author",
        },
      },
    ]

    if (query) {
      pipeline.push({
        $match: {
          $or: [
            { "question.title": { $regex: query, $options: "i" } },
            { "question.content": { $regex: query, $options: "i" } },
          ],
        },
      })
    }

    if (tag) {
      pipeline.push({ $match: { "question.tags.name": tag } })
    }

    if (filter === "unanswered") {
      pipeline.push({ $match: { "question.answers": 0 } })
    }

    pipeline.push(
      { $sort: sortCriteria },
      { $skip: skip },
      { $limit: limit + 1 },
      {
        $project: {
          _id: 0,
          question: {
            _id: "$question._id",
            title: "$question.title",
            content: "$question.content",
            tags: "$question.tags",
            author: { $arrayElemAt: ["$question.author", 0] },
            views: "$question.views",
            upvotes: "$question.upvotes",
            downvotes: "$question.downvotes",
            answers: "$question.answers",
            createdAt: "$question.createdAt",
          },
        },
      }
    )

    const savedCollections = await Collection.aggregate(pipeline)
    const isNext = savedCollections.length > limit
    const questions = JSON.parse(
      JSON.stringify(
        savedCollections
          .slice(0, limit)
          .map((savedCollection) => savedCollection.question)
      )
    ) as QuestionType[]

    return {
      success: true,
      data: {
        questions,
        isNext,
        tags: savedTags.map(({ _id }) => String(_id)),
      },
    }
  } catch (error) {
    return HandleError(
      error instanceof Error ? error : new Error(String(error))
    ) as unknown as ErrorResponse
  }
}