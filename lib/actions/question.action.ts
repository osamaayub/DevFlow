"use server"

import mongoose, { FilterQuery } from "mongoose"
import { revalidatePath } from "next/cache"

import { IQuestion, Question, TagQuestion } from "@/database"
import {
  action,
  AskQuestionSchema,
  EditQuestionSchema,
  GetQuestionSchema,
  paginatedSearchParamsSchema,
  HandleError,
  IncrementQuestionViewsSchema
} from "@/lib"
import {
  PopulatedTag,
  processTags,
  removeTags,
  TagProcessingResult
} from "@/lib/tag-helpers"
import {
  ActionResponse,
  CreateQuestionParams,
  EditQuestionParams,
  ErrorResponse,
  GetQuestionParams,
  IncrementQuestionViewsParams,
  PaginatedSearchParams,
  Question as QuestionType
} from "@/types"

interface PopulatedQuestion {
  _id: mongoose.Types.ObjectId
  title: string
  content: string
  tags: PopulatedTag[]
  author: mongoose.Types.ObjectId
}

interface PopulatedQuestionWithAuthor {
  _id: mongoose.Types.ObjectId
  title: string
  content: string
  tags: {
    _id: mongoose.Types.ObjectId
    name: string
  }[]
  author: {
    _id: mongoose.Types.ObjectId
    name: string
    image: string
  }
  createdAt: Date
  upvotes: number
  downvotes: number
  answers: number
  views: number
}

export async function createQuestion(
  params: CreateQuestionParams
): Promise<ActionResponse<IQuestion>> {
  const validationResult = await action({
    params,
    schema: AskQuestionSchema,
    authorize: true
  })

  if (validationResult instanceof Error) {
    return HandleError(validationResult) as unknown as ErrorResponse
  }

  const { title, content, tags } = validationResult.validatedData
  const userId = validationResult?.session?.user?.id

  const session = await mongoose.startSession()

  session.startTransaction()

  try {
    const [question] = await Question.create(
      [
        {
          title,
          content,
          author: userId
        }
      ],
      { session }
    )

    if (!question) {
      return HandleError(
        new Error("Failed to create question")
      ) as unknown as ErrorResponse
    }

    const {
      tagIds,
      tagQuestionDocuments
    }: TagProcessingResult = await processTags(
      tags,
      question._id,
      session
    )

    await TagQuestion.insertMany(
      tagQuestionDocuments,
      { session }
    )

    await Question.findByIdAndUpdate(
      question._id,
      {
        $push: {
          tags: {
            $each: tagIds
          }
        }
      },
      { session }
    )

    await session.commitTransaction()

    revalidatePath("/")

    return {
      success: true,
      data: JSON.parse(JSON.stringify(question))
    }
  } catch (error) {
    await session.abortTransaction()

    if (error instanceof Error) {
      return HandleError(error) as unknown as ErrorResponse
    }

    return HandleError(
      new Error(String(error))
    ) as unknown as ErrorResponse
  } finally {
    await session.endSession()
  }
}

export async function editQuestion(
  params: EditQuestionParams
): Promise<ActionResponse<IQuestion>> {
  const validationResult = await action({
    params,
    schema: EditQuestionSchema,
    authorize: true
  })

  if (validationResult instanceof Error) {
    return HandleError(validationResult) as unknown as ErrorResponse
  }

  const {
    title,
    content,
    tags,
    questionId
  } = validationResult.validatedData

  const userId = validationResult?.session?.user?.id

  const session = await mongoose.startSession()

  session.startTransaction()

  try {
    const question = (await Question.findById(questionId)
      .populate("tags")
      .session(session)) as unknown as PopulatedQuestion

    if (!question) {
      throw new Error(
        `Question with ${questionId} not found`
      )
    }

    if (question.author.toString() !== userId) {
      throw new Error("Unauthorized access")
    }

    const updateData: Record<string, unknown> = {}

    if (
      question.title !== title ||
      question.content !== content
    ) {
      updateData.title = title
      updateData.content = content
    }

    // Handle tag updates
    const currentTagNames = question.tags.map(
      (tag: PopulatedTag) =>
        tag.name.toLowerCase()
    )

    const newTagNames = tags.map(
      (tag) => tag.toLowerCase()
    )

    const tagsToAdd = tags.filter(
      (tag) =>
        !currentTagNames.includes(
          tag.toLowerCase()
        )
    )

    const tagsToRemove = question.tags.filter(
      (tag: PopulatedTag) =>
        !newTagNames.includes(
          tag.name.toLowerCase()
        )
    )

    const {
      tagIds,
      tagQuestionDocuments
    }: TagProcessingResult = await processTags(
      tagsToAdd,
      question._id,
      session
    )

    await removeTags(
      tagsToRemove,
      question._id,
      session
    )

    if (tagQuestionDocuments.length > 0) {
      await TagQuestion.insertMany(
        tagQuestionDocuments,
        { session }
      )
    }

    if (tagIds.length > 0) {
      updateData.tags = [
        ...question.tags.map(
          (tag: PopulatedTag) => tag._id
        ),
        ...tagIds
      ]
    } else if (tagsToRemove.length > 0) {
      updateData.tags = question.tags
        .filter(
          (tag: PopulatedTag) =>
            !tagsToRemove.some(
              (removedTag: PopulatedTag) =>
                removedTag._id.toString() ===
                tag._id.toString()
            )
        )
        .map(
          (tag: PopulatedTag) => tag._id
        )
    }

    const updatedQuestion =
      await Question.findByIdAndUpdate(
        questionId,
        {
          $set: updateData
        },
        {
          new: true,
          session
        }
      )

    if (!updatedQuestion) {
      throw new Error(
        "Failed to update question"
      )
    }

    await session.commitTransaction()

    revalidatePath("/")
    revalidatePath(
      `/questions/${questionId}`
    )

    return {
      success: true,
      data: JSON.parse(
        JSON.stringify(updatedQuestion)
      )
    }
  } catch (error) {
    await session.abortTransaction()

    if (error instanceof Error) {
      return HandleError(error) as unknown as ErrorResponse
    }

    return HandleError(
      new Error(String(error))
    ) as unknown as ErrorResponse
  } finally {
    await session.endSession()
  }
}

export async function getQuestion(
  params: GetQuestionParams
): Promise<ActionResponse<IQuestion>> {
  const validationResult = await action({
    params,
    schema: GetQuestionSchema
  })

  if (validationResult instanceof Error) {
    return HandleError(validationResult) as unknown as ErrorResponse
  }

  const { questionId } =
    validationResult.validatedData

  try {
    const question = await Question.findById(
      questionId
    )
      .populate([
        {
          path: "tags",
          select: "_id name"
        },
        {
          path: "author",
          select: "_id name image"
        }
      ])
      .lean()

    if (!question) {
      throw new Error(
        `Question with ${questionId} not found`
      )
    }

    return {
      success: true,
      data: JSON.parse(
        JSON.stringify(question)
      )
    }
  } catch (error) {
    if (error instanceof Error) {
      return HandleError(error) as unknown as ErrorResponse
    }

    return HandleError(
      new Error(String(error))
    ) as unknown as ErrorResponse
  }
}

export async function getQuestions(
  params: PaginatedSearchParams
): Promise<
  ActionResponse<{
    questions: QuestionType[]
    isNext: boolean
  }>
> {
  const validateResult = await action({
    params,
    schema: paginatedSearchParamsSchema
  })

  if (validateResult instanceof Error) {
    return HandleError(
      validateResult
    ) as unknown as ErrorResponse
  }

  const {
    page = 1,
    pageSize = 10,
    filter,
    query
  } = validateResult.validatedData

  const skip =
    (Number(page) - 1) * pageSize

  const limit = Number(pageSize)

  const filterQuery: FilterQuery<IQuestion> = {}

  if (filter === "recommended") {
    return {
      success: true,
      data: {
        questions: [],
        isNext: false
      }
    }
  }

  if (query) {
    filterQuery.$or = [
      {
        title: {
          $regex: new RegExp(query, "i")
        }
      },
      {
        content: {
          $regex: new RegExp(query, "i")
        }
      }
    ]
  }

  let sortCriteria: Record<string, 1 | -1> = {}

  switch (filter) {
    case "newest":
      sortCriteria = {
        createdAt: -1
      }
      break

    case "unanswered":
      filterQuery.answers = 0
      sortCriteria = {
        createdAt: -1
      }
      break

    case "popular":
      sortCriteria = {
        upvotes: -1
      }
      break

    default:
      sortCriteria = {
        createdAt: -1
      }
      break
  }

  try {
    const questions =
      (await Question.find(filterQuery)
        .sort(sortCriteria)
        .skip(skip)
        .limit(limit)
        .populate("tags", "_id name")
        .populate("author", "_id name image")
        .lean()) as unknown as PopulatedQuestionWithAuthor[]

    const totalQuestions =
      await Question.countDocuments(
        filterQuery
      )

    const isNext =
      skip + limit < totalQuestions

    const formattedQuestions: QuestionType[] =
      questions.map((question) => ({
        _id: question._id.toString(),

        title: question.title,

        content: question.content,

        tags: question.tags.map((tag) => ({
          _id: tag._id.toString(),
          name: tag.name
        })),

        author: {
          _id: question.author._id.toString(),
          name: question.author.name,
          image: question.author.image
        },

        createdAt: question.createdAt,

        upvotes: question.upvotes,

        downvotes: question.downvotes,

        answers: question.answers,

        views: question.views
      }))

    return {
      success: true,
      data: {
        questions: formattedQuestions,
        isNext
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      return HandleError(
        error
      ) as unknown as ErrorResponse
    }

    return HandleError(
      new Error(String(error))
    ) as unknown as ErrorResponse
  }
}

export const incrementQuestionViews =
  async (
    params: IncrementQuestionViewsParams
  ): Promise<
    ActionResponse<{ views: number }>
  > => {
    try {
      const validationResult =
        await action({
          params,
          schema: IncrementQuestionViewsSchema
        })

      if (
        validationResult instanceof Error
      ) {
        return HandleError(
          validationResult
        ) as unknown as ErrorResponse
      }

      const { questionId } =
        validationResult.validatedData

      if (
        !mongoose.Types.ObjectId.isValid(
          questionId
        )
      ) {
        return HandleError(
          new Error("Invalid questionId")
        ) as unknown as ErrorResponse
      }

      const updatedQuestion =
        await Question.findByIdAndUpdate(
          questionId,
          {
            $inc: {
              views: 1
            }
          },
          {
            new: true
          }
        ).lean()

      if (!updatedQuestion) {
        return HandleError(
          new Error("Question not found")
        ) as unknown as ErrorResponse
      }

      revalidatePath(
        `/questions/${questionId}`
      )

      return {
        success: true,
        data: JSON.parse(
          JSON.stringify(updatedQuestion)
        ) as unknown as {
          views: number
        }
      }
    } catch (error) {
      return HandleError(
        new Error(String(error))
      ) as unknown as ErrorResponse
    }
  }

