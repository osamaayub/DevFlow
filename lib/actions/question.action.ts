"use server"

import mongoose,{FilterQuery} from "mongoose"

import { Question, TagQuestion } from "@/database"
import {
  action,
  AskQuestionSchema,
  EditQuestionSchema,
  GetQuestionSchema,
  paginatedSearchParamsSchema,
  HandleError
} from "@/lib"
import { PopulatedTag, processTags, removeTags, TagProcessingResult } from "@/lib/tag-helpers"
import { createQuestionParams, EditQuestionParams, GetQuestionParams } from "@/types"

interface PopulatedQuestion {
  _id: mongoose.Types.ObjectId
  title: string
  content: string
  tags: PopulatedTag[]
  author: mongoose.Types.ObjectId
}

export async function createQuestion(
  params: createQuestionParams
): Promise<ActionResponse<Question>> {
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
    const [question] = await Question.create([{ title, content, author: userId }], { session })

    if (!question) {
      return HandleError(new Error("Failed to create question")) as unknown as ErrorResponse
    }

    const { tagIds, tagQuestionDocuments }: TagProcessingResult = await processTags(
      tags,
      question._id,
      session
    )

    await TagQuestion.insertMany(tagQuestionDocuments, { session })

    await Question.findByIdAndUpdate(
      question._id,
      { $push: { tags: { $each: tagIds } } },
      { session }
    )

    await session.commitTransaction()

    return { success: true, data: JSON.parse(JSON.stringify(question)) }
  } catch (error) {
    await session.abortTransaction()
    if (error instanceof Error) {
      return HandleError(error) as unknown as ErrorResponse
    }
    return HandleError(new Error(String(error))) as unknown as ErrorResponse
  } finally {
    await session.endSession()
  }
}

export async function editQuestion(params: EditQuestionParams): Promise<ActionResponse<Question>> {
  const validationResult = await action({
    params,
    schema: EditQuestionSchema,
    authorize: true
  })

  if (validationResult instanceof Error) {
    return HandleError(validationResult) as unknown as ErrorResponse
  }
  const { title, content, tags, questionId } = validationResult.validatedData
  const userId = validationResult?.session?.user?.id

  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    const question = (await Question.findById(questionId)
      .populate("tags")
      .session(session)) as unknown as PopulatedQuestion

    if (!question) {
      throw new Error(`Question with ${questionId} not found`)
    }
    if (question.author.toString() !== userId) {
      throw new Error("Unauthorized access")
    }

    const updateData: Record<string, unknown> = {}
    if (question.title !== title || question.content !== content) {
      updateData.title = title
      updateData.content = content
    }

    // Handle tag updates
    const currentTagNames = question.tags.map((tag: PopulatedTag) => tag.name.toLowerCase())
    const newTagNames = tags.map((tag) => tag.toLowerCase())

    const tagsToAdd = tags.filter((tag) => !currentTagNames.includes(tag.toLowerCase()))
    const tagsToRemove = question.tags.filter(
      (tag: PopulatedTag) => !newTagNames.includes(tag.name.toLowerCase())
    )

    const { tagIds, tagQuestionDocuments }: TagProcessingResult = await processTags(
      tagsToAdd,
      question._id,
      session
    )

    await removeTags(tagsToRemove, question._id, session)

    if (tagQuestionDocuments.length > 0) {
      await TagQuestion.insertMany(tagQuestionDocuments, { session })
    }

    if (tagIds.length > 0) {
      updateData.tags = [...question.tags.map((tag: PopulatedTag) => tag._id), ...tagIds]
    } else if (tagsToRemove.length > 0) {
      updateData.tags = question.tags
        .filter(
          (tag: PopulatedTag) =>
            !tagsToRemove.some(
              (removedTag: PopulatedTag) => removedTag._id.toString() === tag._id.toString()
            )
        )
        .map((tag: PopulatedTag) => tag._id)
    }

    const updatedQuestion = await Question.findByIdAndUpdate(
      questionId,
      { $set: updateData },
      { new: true, session }
    )

    if (!updatedQuestion) {
      throw new Error("Failed to update question")
    }

    await session.commitTransaction()

    return { success: true, data: JSON.parse(JSON.stringify(updatedQuestion)) }
  } catch (error) {
    await session.abortTransaction()
    if (error instanceof Error) {
      return HandleError(error) as unknown as ErrorResponse
    }
    return HandleError(new Error(String(error))) as unknown as ErrorResponse
  } finally {
    await session.endSession()
  }
}
export async function getQuestion(params: GetQuestionParams): Promise<ActionResponse<Question>> {
  const validationResult = await action({
    params,
    schema: GetQuestionSchema
  })
  if (validationResult instanceof Error) {
    return HandleError(validationResult) as unknown as ErrorResponse
  }
  const { questionId } = validationResult.validatedData
  try {
    const question = await Question.findById(questionId).populate([
      { path: "tags", select: "name" },
      { path: "author", select: "name image _id" }
    ])
    if (!question) {
      throw new Error(`Question with ${questionId} not found `)
    }
    return { success: true, data: JSON.parse(JSON.stringify(question)) }
  } catch (error) {
    if (error instanceof Error) {
      return HandleError(error) as unknown as ErrorResponse
    }
    return HandleError(new Error(String(error))) as unknown as ErrorResponse
  }
}

export async function getQuestions(
  params: PaginatedSearchParams
): Promise<ActionResponse<{ questions: Question[]; isNext: boolean }>> {
  const validateResult = await action({
    params,
    schema: paginatedSearchParamsSchema
  })
  if (validateResult instanceof Error) {
    return HandleError(validateResult) as unknown as ErrorResponse
  }

  const { page = 1, pageSize = 10, filter, query } = validateResult.validatedData
  const skip = (Number(page) - 1) * pageSize
  const limit = Number(pageSize)

  const filterQuery: FilterQuery<Question> = {}

  if (filter === "recommended") {
    return { success: true, data: { questions: [], isNext: false } }
  }

  if (query) {
    filterQuery.$or = [
      { title: { $regex: new RegExp(query, "i") } },
      { content: { $regex: new RegExp(query, "i") } }
    ]
  }

  let sortCriteria: Record<string, 1 | -1> = {}
  switch (filter) {
    case "newest":
      sortCriteria = { createdAt: -1 }
      break
    case "unanswered":
      filterQuery.answers = 0
      sortCriteria = { createdAt: -1 }
      break
    case "popular":
      sortCriteria = { upvotes: -1 }
      break
    default:
      sortCriteria = { createdAt: -1 }
      break
  }

  try {
    const questions = await Question.find(filterQuery)
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit)
      .populate("tags",'name')
      .populate("author",'name image')
      .lean();

    const totalQuestions = await Question.countDocuments(filterQuery)
    const isNext = skip + limit < totalQuestions

    return {
      success: true,
      data: {
        questions: JSON.parse(JSON.stringify(questions)),
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