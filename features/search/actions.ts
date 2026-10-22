"use server"

import { Answer, Question, Tag, User } from "@/server/db"
import dbConnect from "@/server/db/connect"
import { HandleError } from "@/server/errors/error-handler"
import { GlobalSearchSchema } from "@/shared/lib/validation"
import {
  ActionResponse,
  ErrorResponse,
  GlobalSearchedItem,
  GlobalSearchParams,
} from "@/shared/types"

const SEARCHABLE_TYPES = ["question", "answer", "user", "tag"] as const
const MAX_QUERY_LENGTH = 100

async function searchQuestions(
  regexQuery: { $regex: string; $options: string },
  limit: number
): Promise<GlobalSearchedItem[]> {
  try {
    const questions = await Question.find({ title: regexQuery })
      .select("title _id")
      .limit(limit)
      .lean()

    return (questions || [])
      .filter((item): item is typeof item & { _id: unknown } => Boolean(item?._id))
      .map((item) => ({
        title: item.title || "Untitled Question",
        type: "question" as const,
        id: String(item._id),
      }))
  } catch (error) {
    console.error("Error searching questions:", error)
    return []
  }
}

async function searchUsers(
  regexQuery: { $regex: string; $options: string },
  limit: number
): Promise<GlobalSearchedItem[]> {
  try {
    const users = await User.find({
      $or: [{ name: regexQuery }, { username: regexQuery }],
    })
      .select("name username _id")
      .limit(limit)
      .lean()

    return (users || [])
      .filter((item): item is typeof item & { _id: unknown } => Boolean(item?._id))
      .map((item) => ({
        title: item.name || item.username || "Anonymous User",
        type: "user" as const,
        id: String(item._id),
      }))
  } catch (error) {
    console.error("Error searching users:", error)
    return []
  }
}

async function searchAnswers(
  regexQuery: { $regex: string; $options: string },
  limit: number,
  trimmed: string
): Promise<GlobalSearchedItem[]> {
  try {
    const answers = await Answer.find({ content: regexQuery })
      .select("question _id")
      .limit(limit)
      .lean()

    const snippet = trimmed.length > 25 ? `${trimmed.slice(0, 25)}...` : trimmed

    return (answers || [])
      .filter((item): item is typeof item & { question: unknown; _id: unknown } => Boolean(item?.question))
      .map((item) => {
        const questionId =
          typeof item.question === "object" && item.question !== null && "_id" in item.question
            ? String((item.question as { _id: unknown })._id)
            : String(item.question)

        return {
          title: `Answers containing "${snippet}"`,
          type: "answer" as const,
          id: questionId,
        }
      })
      .filter((item) => Boolean(item.id && item.id !== "undefined" && item.id !== "null"))
  } catch (error) {
    console.error("Error searching answers:", error)
    return []
  }
}

async function searchTags(
  regexQuery: { $regex: string; $options: string },
  limit: number
): Promise<GlobalSearchedItem[]> {
  try {
    const tags = await Tag.find({ name: regexQuery })
      .select("name _id")
      .limit(limit)
      .lean()

    return (tags || [])
      .filter((item): item is typeof item & { _id: unknown } => Boolean(item?._id))
      .map((item) => ({
        title: item.name || "Unnamed Tag",
        type: "tag" as const,
        id: String(item._id),
      }))
  } catch (error) {
    console.error("Error searching tags:", error)
    return []
  }
}

export async function globalSearch(
  params: GlobalSearchParams
): Promise<ActionResponse<GlobalSearchedItem[]>> {
  try {
    const validationResult = GlobalSearchSchema.safeParse(params)
    if (!validationResult.success) {
      return { success: true, data: [] }
    }

    const { query, type } = validationResult.data
    const trimmed = query?.trim().slice(0, MAX_QUERY_LENGTH)

    if (!trimmed) {
      return { success: true, data: [] }
    }

    await dbConnect()

    const sanitizedQuery = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const regexQuery = {
      $regex: sanitizedQuery,
      $options: "i",
    }

    let results: GlobalSearchedItem[] = []
    const typeLower = type?.toLowerCase()

    if (!typeLower || !SEARCHABLE_TYPES.includes(typeLower as (typeof SEARCHABLE_TYPES)[number])) {
      const [questions, users, answers, tags] = await Promise.all([
        searchQuestions(regexQuery, 2),
        searchUsers(regexQuery, 2),
        searchAnswers(regexQuery, 2, trimmed),
        searchTags(regexQuery, 2),
      ])

      results = [...questions, ...users, ...answers, ...tags]
    } else {
      switch (typeLower) {
        case "question":
          results = await searchQuestions(regexQuery, 8)
          break
        case "user":
          results = await searchUsers(regexQuery, 8)
          break
        case "answer":
          results = await searchAnswers(regexQuery, 8, trimmed)
          break
        case "tag":
          results = await searchTags(regexQuery, 8)
          break
        default:
          break
      }
    }

    return { success: true, data: JSON.parse(JSON.stringify(results)) }
  } catch (error) {
    return HandleError(
      error instanceof Error ? error : new Error(String(error))
    ) as unknown as ErrorResponse
  }
}
