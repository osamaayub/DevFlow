'use server'

import { FilterQuery } from "mongoose"

import { User } from "@/database"
import { action, HandleError, paginatedSearchParamsSchema } from "@/lib"

export async function getUsers(
  params: PaginatedSearchParams
): Promise<ActionResponse<{ users: User[]; isNext: boolean }>> {
  const validationResult = await action({
    params,
    schema: paginatedSearchParamsSchema
  })

  if (validationResult instanceof Error) {
    return HandleError(validationResult) as unknown as ErrorResponse
  }

  const { page = 1, pageSize = 10, query, filter } = validationResult.validatedData

  const skip = (Number(page) - 1) * pageSize
  const limit = Number(pageSize)

  const filterQuery: FilterQuery<typeof User> = {}

  if (query) {
    filterQuery.$or = [
      { name: { $regex: query, $options: "i" } },
      { username: { $regex: query, $options: "i" } },
      { email: { $regex: query, $options: "i" } }
    ]
  }

  let sortCriteria = {}

  switch (filter) {
  case "popular":
    sortCriteria = { createdAt: -1 } // This sorts by newest
    break
  case "Moderators":
    sortCriteria = { createdAt: 1 }
    break
  case "reputation":
    sortCriteria = { reputation: -1 } // This sorts by highest reputation
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
        isNext
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      return HandleError(error) as unknown as ErrorResponse
    }
    return HandleError(new Error(String(error))) as unknown as ErrorResponse
  }
}