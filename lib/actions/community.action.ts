"use server"

import { FilterQuery } from "mongoose"

import { IUser, Question, User } from "@/database"
import {
  action,
  GetCommunityMemberSchema,
  HandleError,
  paginatedSearchParamsSchema,
} from "@/lib"
import {
  ActionResponse,
  ErrorResponse,
  PaginatedSearchParams,
  Question as QuestionType,
} from "@/types"

export async function getUsers(
  params: PaginatedSearchParams
): Promise<ActionResponse<{ users: IUser[]; isNext: boolean }>> {
  const validationResult = await action({
    params,
    schema: paginatedSearchParamsSchema,
  })

  if (validationResult instanceof Error) {
    return HandleError(validationResult) as unknown as ErrorResponse
  }

  const { page = 1, pageSize = 10, query, filter } =
    validationResult.validatedData
  const skip = (Number(page) - 1) * pageSize
  const limit = Number(pageSize)
  const filterQuery: FilterQuery<typeof User> = {}

  if (query) {
    filterQuery.$or = [
      { name: { $regex: query, $options: "i" } },
      { username: { $regex: query, $options: "i" } },
      { email: { $regex: query, $options: "i" } },
    ]
  }

  let sortCriteria = {}

  switch (filter) {
    case "popular":
      sortCriteria = { createdAt: -1 }
      break
    case "moderators":
      sortCriteria = { createdAt: 1 }
      break
    case "reputation":
      sortCriteria = { reputation: -1 }
      break
  }

  try {
    const totalUsers = await User.countDocuments(filterQuery)
    const users = await User.find(filterQuery)
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit)
    const isNext = totalUsers > skip + users.length

    return {
      success: true,
      data: {
        users: JSON.parse(JSON.stringify(users)),
        isNext,
      },
    }
  } catch (error) {
    if (error instanceof Error) {
      return HandleError(error) as unknown as ErrorResponse
    }
    return HandleError(new Error(String(error))) as unknown as ErrorResponse
  }
}

export async function getCommunityMember({
  userId,
  page = 1,
  pageSize = 10,
}: {
  userId: string
  page?: number
  pageSize?: number
}): Promise<
  ActionResponse<{
    user: IUser | null
    questions: QuestionType[]
    isNext: boolean
  }>
> {
  const validationResult = await action({
    params: { userId, page, pageSize },
    schema: GetCommunityMemberSchema,
  })

  if (validationResult instanceof Error) {
    return HandleError(validationResult) as unknown as ErrorResponse
  }

  const {
    page: pageNumber,
    pageSize: pageSizeNumber,
  } = validationResult.validatedData
  const skip = (pageNumber - 1) * pageSizeNumber

  try {
    const user = await User.findById(userId)
      .select("_id name username bio image location portfolio reputation joinedAt")
      .lean()

    if (!user) {
      return {
        success: true,
        data: { user: null, questions: [], isNext: false },
      }
    }

    const totalQuestions = await Question.countDocuments({ author: userId })
    const questions = await Question.find({ author: userId })
      .populate("tags", "_id name")
      .populate("author", "_id name image")
      .lean()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSizeNumber)

    return {
      success: true,
      data: JSON.parse(
        JSON.stringify({
          user,
          questions,
          isNext: totalQuestions > skip + questions.length,
        })
      ),
    }
  } catch (error) {
    if (error instanceof Error) {
      return HandleError(error) as unknown as ErrorResponse
    }
    return HandleError(new Error(String(error))) as unknown as ErrorResponse
  }
}
