"use server"

import mongoose, { ClientSession } from "mongoose"

import { Vote } from "@/database"
import { Question, Answer } from "@/database"
import { CreateVoteParams, UpdateVoteCountParams } from "@/types"

import { action, HandleError } from "../handlers"
import { CreateVoteSchema, updateVoteCountSchema } from "../validation"

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

    return {
      success: true,
      data: result
    }
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
      actionId: targetId,
      actionType: targetType
    }).session(session)

    if (existingVote) {
      // If same vote type, remove it (toggle behavior)
      if (existingVote.VoteType === voteType) {
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

        await session.commitTransaction()

        return {
          success: true,
          data: null
        }
      } else {
        // Vote type changed (upvote → downvote or vice versa)
        const oldVoteType = existingVote.VoteType

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
        existingVote.VoteType = voteType
        await existingVote.save({ session })

        await session.commitTransaction()

        return {
          success: true,
          data: existingVote
        }
      }
    } else {
      // Create new vote if it doesn't exist
      const newVote = new Vote({
        author: userId,
        actionId: targetId,
        actionType: targetType,
        VoteType: voteType
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

      await session.commitTransaction()

      return {
        success: true,
        data: newVote
      }
    }
  } catch (error) {
    await session.abortTransaction()
    return HandleError(new Error(String(error))) as unknown as ErrorResponse
  } finally {
    await session.endSession()
  }
}