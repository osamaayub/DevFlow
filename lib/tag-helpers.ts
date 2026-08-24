import mongoose from "mongoose"

import { ITag, Tag, TagQuestion } from "@/database"

export interface PopulatedTag extends ITag {
  _id: mongoose.Types.ObjectId
}

export interface TagProcessingResult {
  tagIds: mongoose.Types.ObjectId[]
  tagQuestionDocuments: Array<{
    tag: mongoose.Types.ObjectId
    question: mongoose.Types.ObjectId
  }>
}

export async function processTags(
  tags: string[],
  questionId: mongoose.Types.ObjectId,
  session: mongoose.ClientSession
): Promise<TagProcessingResult> {
  const tagIds: mongoose.Types.ObjectId[] = []
  const tagQuestionDocuments: Array<{
    tag: mongoose.Types.ObjectId
    question: mongoose.Types.ObjectId
  }> = []

  for (const tag of tags) {
    const existingTag = await Tag.findOneAndUpdate(
      { name: { $regex: new RegExp(`^${tag}$`, "i") } },
      { $setOnInsert: { name: tag }, $inc: { questions: 0 } },
      { upsert: true, new: true, session }
    )

    if (!existingTag) {
      continue
    }

    tagIds.push(existingTag._id)
    tagQuestionDocuments.push({
      tag: existingTag._id,
      question: questionId
    })
  }

  return { tagIds, tagQuestionDocuments }
}

export async function removeTags(
  tagsToRemove: PopulatedTag[],
  questionId: mongoose.Types.ObjectId,
  session: mongoose.ClientSession
): Promise<void> {
  for (const tag of tagsToRemove) {
    await Tag.findByIdAndUpdate(
      tag._id,
      { $inc: { questions: -1 } },
      { session }
    )

    await TagQuestion.deleteOne(
      { tag: tag._id, question: questionId },
      { session }
    )
  }
}
