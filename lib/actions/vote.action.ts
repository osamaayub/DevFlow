"use server"

import mongoose, { ClientSession } from "mongoose"
import { revalidatePath } from "next/cache"

import ROUTES from "@/constants/route"
import { Vote } from "@/database"
import { Question, Answer } from "@/database"
import { CreateVoteParams, UpdateVoteCountParams } from "@/types"

import { action, HandleError } from "../handlers"
import {
  CreateVoteSchema,
  GetUserVotesForTargetsSchema,
  updateVoteCountSchema
} from "../validation"

async function revalidateVoteTarget(
  targetType: "question" | "answer",
  targetId: string
): Promise<void> {
  try {
    if (targetType === "question") {
      revalidatePath(ROUTES.QUESTION(targetId))
      return
    }

    const answer = await Answer.findById(targetId).select("question")
    if (answer?.question) {
      revalidatePath(ROUTES.QUESTION(String(answer.question)))
    }
  } catch {
    // Revalidation must not fail the vote response after a successful commit.
  }
}

async function commitVoteTransaction(
  session: ClientSession,
  targetType: "question" | "answer",
  targetId: string
): Promise<void> {
  await session.commitTransaction()
  await revalidateVoteTarget(targetType, targetId)
}

export async function UpdateVote(
  params: UpdateVoteCountParams,
  session?: ClientSession
): Promise<ActionResponse> {
  const validationResult = await action({
    params,
    schema: updateVoteCountSchema
  })

  if (validationResult instanceof Error) {
    return HandleError(validationResult) as unknown as ErrorResponse
  }

  const { targetId, targetType, voteType, change } = validationResult.validatedData

  try {
    const Model = targetType === "question" ? Question : Answer
    const voteField = voteType === "upvote" ? "upvotes" : "downvotes"

    const result = await Model.findByIdAndUpdate(
      targetId,
      { $inc: { [voteField]: change } },
      { new: true, session }
    )

    if (!result) {
      return HandleError(
        new Error("Failed to update the vote count")
      ) as unknown as ErrorResponse
    }

    return { success: true }
  } catch (error) {
    return HandleError(new Error(String(error))) as unknown as ErrorResponse
  }
}

export async function CreateVote(params: CreateVoteParams): Promise<ActionResponse> {
  const validationResult = await action({
    params,
    schema: CreateVoteSchema,
    authorize: true
  })

  if (validationResult instanceof Error) {
    return HandleError(validationResult) as unknown as ErrorResponse
  }

  const { targetId, targetType, voteType } = validationResult.validatedData
  const userId = validationResult.session?.user?.id

  if (!userId) {
    return HandleError(new Error("Unauthorized User")) as unknown as ErrorResponse
  }

  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    // Check if vote already exists
    const existingVote = await Vote.findOne({
      author: userId,
      id: targetId,
      type: targetType
    }).session(session)

    if (existingVote) {
      // If same vote type, remove it (toggle behavior)
      if (existingVote.value === voteType) {
        await Vote.deleteOne({ _id: existingVote._id }).session(session)

        // Decrement the vote count
        const updateResult = await UpdateVote(
          {
            targetId,
            targetType,
            voteType,
            change: -1
          },
          session
        )

        if (!updateResult.success) {
          await session.abortTransaction()
          return updateResult
        }

        await commitVoteTransaction(session, targetType, targetId)

        return { success: true }
      } else {
        // Vote type changed (upvote → downvote or vice versa)
        const oldVoteType = existingVote.value

        // Decrement old vote type
        const decrementResult = await UpdateVote(
          {
            targetId,
            targetType,
            voteType: oldVoteType,
            change: -1
          },
          session
        )

        if (!decrementResult.success) {
          await session.abortTransaction()
          return decrementResult
        }

        // Increment new vote type
        const incrementResult = await UpdateVote(
          {
            targetId,
            targetType,
            voteType,
            change: 1
          },
          session
        )

        if (!incrementResult.success) {
          await session.abortTransaction()
          return incrementResult
        }

        // Update the vote document
        existingVote.value = voteType
        await existingVote.save({ session })

        await commitVoteTransaction(session, targetType, targetId)

        return { success: true }
      }
    } else {
      // Create new vote if it doesn't exist
      const newVote = new Vote({
        author: userId,
        id: targetId,
        type: targetType,
        value: voteType
      })

      await newVote.save({ session })

      // Increment the vote count
      const updateResult = await UpdateVote(
        {
          targetId,
          targetType,
          voteType,
          change: 1
        },
        session
      )

      if (!updateResult.success) {
        await session.abortTransaction()
        return updateResult
      }

      await commitVoteTransaction(session, targetType, targetId)

      return { success: true }
    }
  } catch (error) {
    await session.abortTransaction()
    return HandleError(new Error(String(error))) as unknown as ErrorResponse
  } finally {
    await session.endSession()
  }
}

export async function getUserVotesForTargets(params: {
  targetIds: string[]
  targetType: "question" | "answer"
}): Promise<ActionResponse<Record<string, "upvote" | "downvote">>> {
  const validationResult = await action({
    params,
    schema: GetUserVotesForTargetsSchema,
    authorize: true
  })

  if (validationResult instanceof Error) {
    return HandleError(validationResult) as unknown as ErrorResponse
  }

  const { targetIds, targetType } = validationResult.validatedData
  const userId = validationResult.session?.user?.id

  if (!userId) {
    return { success: true, data: {} }
  }

  try {
    const votes = await Vote.find({
      author: userId,
      id: { $in: targetIds },
      type: targetType
    }).select("id value")

    const voteMap = votes.reduce<Record<string, "upvote" | "downvote">>((acc, vote) => {
      acc[String(vote.id)] = vote.value
      return acc
    }, {})

    return {
      success: true,
      data: voteMap
    }
  } catch (error) {
    return HandleError(new Error(String(error))) as unknown as ErrorResponse
  }
}