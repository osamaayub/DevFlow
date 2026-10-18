"use server"

import { Types, type FilterQuery } from "mongoose"
import { unstable_cache } from "next/cache"

import { action } from "@/server/action"
import { CACHE_REVALIDATE_SECONDS, CACHE_TAGS } from "@/server/cache-tags"
import { IQuestion, ITag, Question, Tag } from "@/server/db"
import dbConnect from "@/server/db/connect"
import { HandleError } from "@/server/errors/error-handler"
import { GetTagQuestionsSchema, paginatedSearchParamsSchema } from "@/shared/lib/validation"
import {
  ActionResponse,
  ErrorResponse,
  GetTagQuestionsParams,
  PaginatedSearchParams,
} from "@/shared/types"


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

// Shown in the right sidebar on almost every page
const getCachedTopTags = unstable_cache(
  async () => {
    await dbConnect()

    const tags = await Tag.find({})
      .sort({ questions: -1, name: 1 })
      .limit(TOP_TAGS_LIMIT)
      .lean()

    return JSON.parse(JSON.stringify(tags)) as ITag[]
  },
  ["top-tags"],
  { tags: [CACHE_TAGS.tags], revalidate: CACHE_REVALIDATE_SECONDS.tags }
)

const getCachedTagList = unstable_cache(
  async (page: number, pageSize: number, query: string, filter: string) => {
    await dbConnect()

    const skip = (page - 1) * pageSize
    const filterQuery: FilterQuery<typeof Tag> = {}
    if (query) {
      filterQuery.name = { $regex: escapeRegex(query), $options: "i" }
    }

    const tags = await Tag.find(filterQuery)
      .sort(getTagSortCriteria(filter))
      .skip(skip)
      .limit(pageSize + 1)
      .lean()

    return {
      tags: JSON.parse(JSON.stringify(tags.slice(0, pageSize))) as ITag[],
      isNext: tags.length > pageSize,
    }
  },
  ["tag-list"],
  { tags: [CACHE_TAGS.tags], revalidate: CACHE_REVALIDATE_SECONDS.tags }
)

export const getTopTags = async (): Promise<ActionResponse<{ tags: ITag[] }>> => {
  try {
    return {
      success: true,
      data: { tags: await getCachedTopTags() },
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
  try {
    return {
      success: true,
      data: await getCachedTagList(page, pageSize, query ?? "", filter ?? ""),
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