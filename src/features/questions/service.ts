import "server-only"

import mongoose from "mongoose"

import { processTags } from "@/features/tags/tag-helpers"
import { Question, TagQuestion } from "@/server/db"
import dbConnect from "@/server/db/connect"
import type { Question as QuestionType } from "@/shared/types"

interface InsertQuestionInput {
  title: string
  content: string
  tags: string[]
  authorId: string
}

/**
 * Creates a question with its tags in one transaction. Shared by the createQuestion server
 * action and the POST /api/questions route. Callers validate input, check auth and handle
 * cache invalidation, because the right invalidation API differs between the two.
 */
export async function insertQuestion({
  title,
  content,
  tags,
  authorId,
}: InsertQuestionInput): Promise<QuestionType> {
  await dbConnect()

  const session = await mongoose.startSession()

  try {
    let created: unknown

    // withTransaction commits on success, aborts on any throw and retries transient errors
    await session.withTransaction(async () => {
      const [question] = await Question.create([{ title, content, author: authorId }], {
        session,
      })
      if (!question) throw new Error("Failed to create the question")

      const { tagIds, tagQuestionDocuments } = await processTags(
        tags,
        question._id as mongoose.Types.ObjectId,
        session
      )

      if (tagQuestionDocuments.length > 0) {
        await TagQuestion.insertMany(tagQuestionDocuments, { session })
      }

      question.tags = tagIds
      await question.save({ session })
      created = question
    })

    return JSON.parse(JSON.stringify(created)) as QuestionType
  } finally {
    await session.endSession()
  }
}
