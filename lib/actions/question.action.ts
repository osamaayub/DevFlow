"use server"

import mongoose from "mongoose"

import { Question, Tag, TagQuestion } from "@/database"
import { action, AskQuestionSchema, HandleError } from "@/lib"
import { createQuestionParams } from "@/types"

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

    const tagIds: mongoose.Types.ObjectId[] = []
    const tagQuestionDocuments: Array<{ tag: mongoose.Types.ObjectId; question: mongoose.Types.ObjectId }> = []

    for (const tag of tags) {
      const existingTag = await Tag.findOneAndUpdate(
        { name: { $regex: new RegExp(`^${tag}$`, "i") } },
        { $setOnInsert: { name: tag }, $inc: { questions: 1 } },
        { upsert: true, new: true, session }
      )

      if (!existingTag) {
        continue
      }

      tagIds.push(existingTag._id)
      tagQuestionDocuments.push({
        tag: existingTag._id,
        question: question._id
      })
    }

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
