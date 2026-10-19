"use server"

import { Types } from "mongoose"
import { revalidatePath } from "next/cache"

import { action } from "@/server/action"
import { auth } from "@/server/auth"
import { Answer, IUser, Question, Tag, User, Vote } from "@/server/db"
import { HandleError } from "@/server/errors/error-handler"
import { NotFoundError } from "@/server/errors/http-error"
import { assignBadges } from "@/shared/lib/utils"
import {
  GetUserActivityPageSchema,
  GetUserSchema,
  UpdateUserProfileSchema,
} from "@/shared/lib/validation"
import {
  ActionResponse,
  Badges,
  ErrorResponse,
  GetUserParams,
  Question as QuestionType,
  UserStats,
} from "@/shared/types"

const TOP_TAGS_LIMIT = 6

type UserTopTag = { _id: string; name: string; count: number }

const handleActionError = (error: unknown): ErrorResponse =>
  HandleError(
    error instanceof Error ? error : new Error(String(error))
  ) as unknown as ErrorResponse

const getAnswerVoteStates = async (answerIds: string[]) => {
  if (answerIds.length === 0) {
    return new Map<string, { hasUpVoted: boolean; hasDownVoted: boolean }>()
  }

  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return new Map<string, { hasUpVoted: boolean; hasDownVoted: boolean }>()
  }

  const votes = await Vote.find({
    author: userId,
    id: { $in: answerIds },
    type: "answer",
  })
    .select("id value")
    .lean()

  return new Map(
    votes.map((vote) => [
      String(vote.id),
      {
        hasUpVoted: vote.value === "upvote",
        hasDownVoted: vote.value === "downvote",
      },
    ])
  )
}

const getUserTopTags: (authorId: Types.ObjectId) => Promise<UserTopTag[]> = async (
  authorId
) => {
  const pipeline = [
    { $match: { author: authorId } },
    { $unwind: "$tags" },
    { $group: { _id: "$tags", count: { $sum: 1 } } },
    { $limit: TOP_TAGS_LIMIT },
    { $project: { _id: 1, count: 1 } },
  ]

  const tags = await Question.aggregate<{
    _id: Types.ObjectId
    count: number
  }>(pipeline)

  if (tags.length === 0) {
    return []
  }

  const tagDocuments = await Tag.find({
    _id: { $in: tags.map(({ _id }) => _id) },
  })
    .select("name")
    .lean()
  const tagNamesById = new Map(
    tagDocuments.map((tag) => [String(tag._id), tag.name])
  )

  return tags.flatMap(({ _id, count }) => {
    const id = String(_id)
    const name = tagNamesById.get(id)
    return name === undefined ? [] : [{ _id: id, name, count }]
  })
}

/**
 * Totals for a user's questions and answers, and the badges they earn. Two aggregations run
 * in parallel, each a single pass over the user's documents (indexed by author).
 * Shared by getUser and getUserStats so the profile and the stats action always agree.
 */
const computeUserStats = async (authorId: Types.ObjectId): Promise<UserStats> => {
  const [[questionStats], [answerStats]] = await Promise.all([
    Question.aggregate<{ count: number; upvotes: number; views: number }>([
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
    Answer.aggregate<{ count: number; upvotes: number }>([
      { $match: { author: authorId } },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          upvotes: { $sum: "$upvotes" },
        },
      },
    ]),
  ])

  // A user with no questions or answers gets no group back, so default everything to 0
  const totalQuestions = questionStats?.count ?? 0
  const totalAnswers = answerStats?.count ?? 0
  const questionUpvotes = questionStats?.upvotes ?? 0
  const answerUpvotes = answerStats?.upvotes ?? 0
  const totalViews = questionStats?.views ?? 0

  // Upvotes received on questions and answers count together toward the upvote badge
  const badges = assignBadges({
    criteria: [
      { type: "ANSWER_COUNT", count: totalAnswers },
      { type: "QUESTION_COUNT", count: totalQuestions },
      { type: "QUESTION_UPVOTES", count: questionUpvotes + answerUpvotes },
      { type: "TOTAL_VIEWS", count: totalViews },
    ],
  })

  return {
    totalQuestions,
    totalAnswers,
    questionUpvotes,
    answerUpvotes,
    totalUpvotes: questionUpvotes + answerUpvotes,
    totalViews,
    badges,
  }
}

/**
 * A user's question and answer counts and the badges they earn. Upvotes received (on
 * questions and answers) and total question views count toward the badges.
 */
export async function getUserStats(params: GetUserParams): Promise<
  ActionResponse<{
    totalQuestions: number
    totalAnswers: number
    badges: Badges
  }>
> {
  const validationResult = await action({
    params,
    schema: GetUserSchema,
  })

  if (validationResult instanceof Error) {
    return handleActionError(validationResult)
  }

  const { userId } = params;

  try {
    const [questionStats] = await Question.aggregate([
      { $match: { author: new Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          upvotes: { $sum: "$upvotes" },
          views: { $sum: "$views" },
        },
      },
    ]);

    const [answerStats] = await Answer.aggregate([
      { $match: { author: new Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          upvotes: { $sum: "$upvotes" },
        },
      },
    ]);

    const badges = assignBadges({
      criteria: [
        { type: "ANSWER_COUNT", count: answerStats.count },
        { type: "QUESTION_COUNT", count: questionStats.count },
        {
          type: "QUESTION_UPVOTES",
          count: questionStats.upvotes + answerStats.upvotes,
        },
        { type: "TOTAL_VIEWS", count: questionStats.views },
      ],
    });

    return {
      success: true,
      data: {
        totalQuestions: questionStats.count,
        totalAnswers: answerStats.count,
        badges,
      },
    };
  } catch (error) {
    return handleActionError(error);
  }
}

export const getUser = async (
  params: GetUserParams
): Promise<
  ActionResponse<{
    user: IUser
    totalQuestions: number
    totalAnswers: number
    hasMoreQuestions: boolean
    hasMoreAnswers: boolean
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
      downvotes: number
      hasUpVoted: boolean
      hasDownVoted: boolean
      createdAt: Date | string
      question: {
        _id: string
        title: string
        answers: number
        views: number
      } | null
    }>
    topTags: UserTopTag[]
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
    const [stats, topQuestions, topAnswers, topTags] =
      await Promise.all([
        computeUserStats(authorId),
        Question.find({ author: authorId })
          .populate("tags", "_id name")
          .sort({ upvotes: -1, views: -1, createdAt: -1 })
          .limit(4)
          .lean(),
        Answer.find({ author: authorId })
          .populate({
            path: "question",
            select: "_id title answers views",
          })
          .sort({ upvotes: -1, createdAt: -1 })
          .limit(4)
          .lean(),
        getUserTopTags(authorId),
      ])

    const { totalQuestions, totalAnswers, badges } = stats
    const topAnswerVotes = await getAnswerVoteStates(
      topAnswers.slice(0, 3).map((answer) => String(answer._id))
    )


    return {
      success: true,
      data: {
        user: JSON.parse(JSON.stringify(user)),
        totalQuestions,
        totalAnswers,
        hasMoreQuestions: topQuestions.length > 3,
        hasMoreAnswers: topAnswers.length > 3,
        badges,
        topQuestions: JSON.parse(JSON.stringify(topQuestions.slice(0, 3))),
        topAnswers: JSON.parse(
          JSON.stringify(
            topAnswers.slice(0, 3).map((answer) => ({
              ...answer,
              downvotes: answer.downvotes ?? 0,
              ...(topAnswerVotes.get(String(answer._id)) ?? {
                hasUpVoted: false,
                hasDownVoted: false,
              }),
            }))
          )
        ),
        topTags,
      },
    }
  } catch (error) {
    return handleActionError(error)
  }
}

export const getUserQuestionsActivity = async (params: {
  userId: string
  page: number
  pageSize?: number
}): Promise<
  ActionResponse<{
    questions: QuestionType[]
    isNext: boolean
  }>
> => {
  const validationResult = await action({
    params,
    schema: GetUserActivityPageSchema,
  })

  if (validationResult instanceof Error) {
    return handleActionError(validationResult)
  }

  const { userId, page, pageSize = 10 } = validationResult.validatedData

  try {
    const authorId = new Types.ObjectId(userId)
    const skip = (page - 1) * pageSize

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
        isNext: skip + questions.length < total,
      },
    }
  } catch (error) {
    return handleActionError(error)
  }
}

export const getUserAnswersActivity = async (params: {
  userId: string
  page: number
  pageSize?: number
}): Promise<
  ActionResponse<{
    answers: Array<{
      _id: string
      content: string
      upvotes: number
      downvotes: number
      hasUpVoted: boolean
      hasDownVoted: boolean
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
    schema: GetUserActivityPageSchema,
  })

  if (validationResult instanceof Error) {
    return handleActionError(validationResult)
  }

  const { userId, page, pageSize = 10 } = validationResult.validatedData

  try {
    const authorId = new Types.ObjectId(userId)
    const skip = (page - 1) * pageSize

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

    const answerVotes = await getAnswerVoteStates(
      answers.map((answer) => String(answer._id))
    )

    return {
      success: true,
      data: {
        answers: JSON.parse(
          JSON.stringify(
            answers.map((answer) => ({
              ...answer,
              downvotes: answer.downvotes ?? 0,
              ...(answerVotes.get(String(answer._id)) ?? {
                hasUpVoted: false,
                hasDownVoted: false,
              }),
            }))
          )
        ),
        isNext: skip + answers.length < total,
      },
    }
  } catch (error) {
    return handleActionError(error)
  }
}

export const updateUserProfile = async (params: {
  name: string
  username: string
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
    const { name, username, bio, location, portfolio } = validationResult.validatedData
    const existingUsername = await User.findOne({
      username,
      _id: { $ne: userId },
    }).select("_id").lean()

    if (existingUsername) {
      return {
        success: false,
        status: 409,
        error: { message: "Username already exists." },
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          name,
          username,
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
