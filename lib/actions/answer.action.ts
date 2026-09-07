"use server"
import mongoose from "mongoose"
import {revalidatePath} from "next/cache"

import ROUTES from "@/constants/route"
import { IAnswer,Question,Answer } from "@/database";
import { CreateAnswerParams } from "@/types";

import { action, HandleError } from "../handlers";
import { CreateAnswerSchema } from "../validation";

export async function createAnswer(
  params: CreateAnswerParams
): Promise<ActionResponse<IAnswer>> {
  const validationResult = await action({
    params,
    schema: CreateAnswerSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return HandleError(validationResult) as unknown as ErrorResponse;
  }

  const { content,questionId } = validationResult.validatedData;
  const userId = validationResult.session?.user?.id;

  const session = await mongoose.startSession();
  session.startTransaction();
  try {

    const question = await Question.findById(questionId);

    if (!question) {
      throw new Error("Question not found");
    }

    const [answer] = await Answer.create(
      [
        {
          author: userId,
          content,
          question:questionId
        },
      ],
      { session }
    );
    if(!answer){
      throw new Error("failed to create an answer");

    }
    question.answers += 1;
    await question.save({session});

    await session.commitTransaction();
    revalidatePath(ROUTES.QUESTION(questionId))

    return {
      success: true,
      data: JSON.parse(JSON.stringify(answer)), 
    };
  } catch (error) {
    await session.abortTransaction();
    
    const finalError = error instanceof Error ? error : new Error(String(error));
    return HandleError(finalError) as unknown as ErrorResponse;
    
  } finally {
    await session.endSession();
  }
}