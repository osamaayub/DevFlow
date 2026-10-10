"use server"

import { Types, type FilterQuery } from "mongoose"

import { IQuestion, ITag, Question, Tag } from "@/database"
import {
  action,
  GetTagQuestionsSchema,
  HandleError,
  paginatedSearchParamsSchema,
} from "@/lib"
import {
  ActionResponse,
  ErrorResponse,
  GetTagQuestionsParams,
  PaginatedSearchParams,
} from "@/types"

import dbConnect from "../mongoose"

const TOP_TAGS_LIMIT = 5

type SortCriteria = Record<string, 1 | -1>

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

const handleActionError = (error: unknown): ErrorResponse =>
  HandleError(
    error instanceof Error ? error : new Error(String(error))
  ) as unknown as ErrorResponse

const getTagSortCriteria = (filter?: string): SortCriteria => {
  switch (filter) {
    case "recent":
      return { createdAt: -1, _id: -1 }
    case "oldest":
      return { createdAt: 1, _id: 1 }
    case "name":
      return { name: 1, _id: 1 }
    case "popular":
    default:
      return { questions: -1, _id: 1 }
  }
}

const getQuestionSortCriteria = (filter?: string): SortCriteria => {
  switch (filter) {
    case "name":
      return { title: 1, _id: 1 }
    case "recent":
      return { createdAt: -1, _id: -1 }
    case "oldest":
      return { createdAt: 1, _id: 1 }
    case "popular":
    default:
      return { upvotes: -1, createdAt: -1, _id: -1 }
  }
}

export const getTopTags = async (): Promise<ActionResponse<{ tags: ITag[] }>> => {
  try {
    await dbConnect()

    const tags = await Tag.find({})
      .sort({ questions: -1, name: 1 })
      .limit(TOP_TAGS_LIMIT)
      .lean()

    return {
      success: true,
      data: { tags: JSON.parse(JSON.stringify(tags)) },
    }
  } catch (error) {
    return handleActionError(error)
  }
}

export const getTags = async (
  params: PaginatedSearchParams
): Promise<ActionResponse<{ tags: ITag[]; isNext: boolean }>> => {
  const validationResult = await action({
    params,
    schema: paginatedSearchParamsSchema,
  })

  if (validationResult instanceof Error) {
    return handleActionError(validationResult)
  }

  const {
    page = 1,
    pageSize = 10,
    query,
    filter,
  } = validationResult.validatedData
  const skip = (page - 1) * pageSize

  const filterQuery: FilterQuery<typeof Tag> = {}

  if (query) {
    filterQuery.name = { $regex: escapeRegex(query), $options: "i" }
  }

  try {
    const [tags, totalTags] = await Promise.all([
      Tag.find(filterQuery)
        .sort(getTagSortCriteria(filter))
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Tag.countDocuments(filterQuery),
    ])

    const isNext = totalTags > skip + tags.length

    return {
      success: true,
      data: {
        tags: JSON.parse(JSON.stringify(tags)),
        isNext,
      },
    }
  } catch (error) {
    return handleActionError(error)
  }
}

export const getTagQuestions = async (
  params: GetTagQuestionsParams
): Promise<
  ActionResponse<{ tag: ITag; questions: IQuestion[]; isNext: boolean }>
> => {
  const validationResult = await action({
    params,
    schema: GetTagQuestionsSchema,
  })

  if (validationResult instanceof Error) {
    return handleActionError(validationResult)
  }

  const {
    tagId,
    page = 1,
    pageSize = 10,
    query,
    filter,
  } =
    validationResult.validatedData
  const skip = (page - 1) * pageSize

  try {
    const tag = await Tag.findById(tagId).lean()
    if (!tag) throw new Error("Tag not found")

    const tagObjectId = new Types.ObjectId(tagId)
    const filterQuery: FilterQuery<IQuestion> = {
      tags: { $in: [tagObjectId] },
    }

    if (query) {
      filterQuery.title = { $regex: escapeRegex(query), $options: "i" }
    }

    const [questions, totalQuestions] = await Promise.all([
      Question.find(filterQuery)
        .select("_id title views answers upvotes downvotes author tags createdAt")
        .populate([
          { path: "author", select: "name image _id" },
          { path: "tags", select: "name _id" },
        ])
        .sort(getQuestionSortCriteria(filter))
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Question.countDocuments(filterQuery),
    ])

    const isNext = totalQuestions > skip + questions.length

    return {
      success: true,
      data: {
        tag: JSON.parse(JSON.stringify(tag)),
        questions: JSON.parse(JSON.stringify(questions)),
        isNext,
      },
    }
  } catch (error) {
    return handleActionError(error)
  }
}