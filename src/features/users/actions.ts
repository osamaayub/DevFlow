"use server"

import { Types } from "mongoose"
import { revalidatePath } from "next/cache"

import { action } from "@/server/action"
import { Answer, IUser, Question, User } from "@/server/db"
import { HandleError } from "@/server/errors/error-handler"
import { NotFoundError } from "@/server/errors/http-error"
import { assignBadges } from "@/shared/lib/utils"
import {
  GetUserActivitySchema,
  GetUserSchema,
  UpdateUserProfileSchema,
} from "@/shared/lib/validation"
import {
  ActionResponse,
  Badges,
  ErrorResponse,
  GetUserParams,
  Question as QuestionType,
} from "@/shared/types"

const handleActionError = (error: unknown): ErrorResponse =>
  HandleError(
    error instanceof Error ? error : new Error(String(error))
  ) as unknown as ErrorResponse

export const getUser = async (
  params: GetUserParams
): Promise<
  ActionResponse<{
    user: IUser
    totalQuestions: number
    totalAnswers: number
    badges: Badges
    topQuestions: Array<{
      _id: string
      title: string
      views: number
      upvotes: number
      answers: number
      createdAt: Date | string
      tags: Array<{ _id: string; name: string }>
    }>
    topAnswers: Array<{
      _id: string
      content: string
      upvotes: number
      createdAt: Date | string
      question: {
        _id: string
        title: string
        answers: number
        views: number
      } | null
    }>
    topTags: Array<{ _id: string; name: string; count: number }>
  }>
> => {
  const validationResult = await action({
    params,
    schema: GetUserSchema,
  })

  if (validationResult instanceof Error) {
    return handleActionError(validationResult)
  }

  const { userId } = validationResult.validatedData

  try {
    const user = await User.findById(userId)
      .select("-password")
      .lean()

    if (!user) throw new NotFoundError({ user: ["User not found"] })

    const authorId = new Types.ObjectId(userId)

    const [[questionStats], [answerStats], topQuestions, topAnswers, authoredQuestions] =
      await Promise.all([
        Question.aggregate([
          { $match: { author: authorId } },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
              upvotes: { $sum: "$upvotes" },
              views: { $sum: "$views" },
            },
          },
        ]),
        Answer.aggregate([
          { $match: { author: authorId } },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
              upvotes: { $sum: "$upvotes" },
            },
          },
        ]),
        Question.find({ author: authorId })
          .populate("tags", "_id name")
          .sort({ upvotes: -1, views: -1, createdAt: -1 })
          .limit(3)
          .lean(),
        Answer.find({ author: authorId })
          .populate({
            path: "question",
            select: "_id title answers views",
          })
          .sort({ upvotes: -1, createdAt: -1 })
          .limit(3)
          .lean(),
        Question.find({ author: authorId })
          .populate("tags", "_id name")
          .lean(),
      ])

    const totalQuestions = questionStats?.count ?? 0
    const totalAnswers = answerStats?.count ?? 0

    const badges = assignBadges({
      criteria: [
        { type: "QUESTION_COUNT", count: totalQuestions },
        { type: "ANSWER_COUNT", count: totalAnswers },
        { type: "QUESTION_UPVOTES", count: questionStats?.upvotes ?? 0 },
        { type: "ANSWER_UPVOTES", count: answerStats?.upvotes ?? 0 },
        { type: "TOTAL_VIEWS", count: questionStats?.views ?? 0 },
      ],
    })

    const tagCounts = new Map<string, { _id: string; name: string; count: number }>()

    for (const question of authoredQuestions) {
      for (const tag of question.tags ?? []) {
        const tagId = String(tag._id)
        const existingTag = tagCounts.get(tagId)

        if (existingTag) {
          existingTag.count += 1
          continue
        }

        tagCounts.set(tagId, {
          _id: tagId,
          name: tag.name,
          count: 1,
        })
      }
    }

    const topTags = [...tagCounts.values()]
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
      .slice(0, 6)

    return {
      success: true,
      data: {
        user: JSON.parse(JSON.stringify(user)),
        totalQuestions,
        totalAnswers,
        badges,
        topQuestions: JSON.parse(JSON.stringify(topQuestions)),
        topAnswers: JSON.parse(JSON.stringify(topAnswers)),
        topTags,
      },
    }
  } catch (error) {
    return handleActionError(error)
  }
}

export const getUserActivity = async (params: {
  userId: string
  type: "questions" | "answers"
  page: number
  pageSize?: number
}): Promise<
  ActionResponse<{
    questions: QuestionType[]
    answers: Array<{
      _id: string
      content: string
      upvotes: number
      createdAt: Date | string
      question: {
        _id: string
        title: string
        answers: number
        views: number
      } | null
    }>
    isNext: boolean
  }>
> => {
  const validationResult = await action({
    params,
    schema: GetUserActivitySchema,
  })

  if (validationResult instanceof Error) {
    return handleActionError(validationResult)
  }

  const { userId, type, page, pageSize = 3 } = validationResult.validatedData

  try {
    const authorId = new Types.ObjectId(userId)
    const skip = (page - 1) * pageSize

    if (type === "questions") {
      const [questions, total] = await Promise.all([
        Question.find({ author: authorId })
          .populate("tags", "_id name")
          .populate("author", "_id name image")
          .sort({ upvotes: -1, views: -1, createdAt: -1 })
          .skip(skip)
          .limit(pageSize)
          .lean(),
        Question.countDocuments({ author: authorId }),
      ])

      return {
        success: true,
        data: {
          questions: JSON.parse(JSON.stringify(questions)),
          answers: [],
          isNext: skip + questions.length < total,
        },
      }
    }

    const [answers, total] = await Promise.all([
      Answer.find({ author: authorId })
        .populate({
          path: "question",
          select: "_id title answers views",
        })
        .sort({ upvotes: -1, createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Answer.countDocuments({ author: authorId }),
    ])

    return {
      success: true,
      data: {
        questions: [],
        answers: JSON.parse(JSON.stringify(answers)),
        isNext: skip + answers.length < total,
      },
    }
  } catch (error) {
    return handleActionError(error)
  }
}

export const updateUserProfile = async (params: {
  bio: string
  location: string
  portfolio: string
}): Promise<ActionResponse> => {
  const validationResult = await action({
    params,
    schema: UpdateUserProfileSchema,
    authorize: true,
  })

  if (validationResult instanceof Error) {
    return handleActionError(validationResult)
  }

  const userId = validationResult.session?.user?.id
  if (!userId) {
    return handleActionError(new Error("You must be signed in to update your profile."))
  }

  try {
    const { bio, location, portfolio } = validationResult.validatedData
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          bio: bio.trim(),
          location: location.trim(),
          portfolio: portfolio.trim(),
        },
      },
      { new: true, runValidators: true }
    )

    if (!user) throw new NotFoundError({ user: ["User not found"] })

    revalidatePath(`/profile/${userId}`)
    revalidatePath("/profile/edit")

    return { success: true }
  } catch (error) {
    return handleActionError(error)
  }
}
