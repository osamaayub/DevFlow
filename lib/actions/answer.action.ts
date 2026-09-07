"use server"
import mongoose from "mongoose"
import { revalidatePath } from "next/cache"

import ROUTES from "@/constants/route"
import { IAnswer, Question, Answer } from "@/database";
import { CreateAnswerParams, GetAnswersParams } from "@/types";

import { action, HandleError } from "../handlers";
import { CreateAnswerSchema, GetAnswersSchema } from "../validation";

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

  const { content, questionId } = validationResult.validatedData;
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
          question: questionId
        },
      ],
      { session }
    );
    
    if (!answer) {
      throw new Error("Failed to create an answer");
    }
    
    question.answers += 1;
    await question.save({ session });

    await session.commitTransaction();
    revalidatePath(ROUTES.QUESTION(questionId));

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

export async function getAnswers(
  params:GetAnswersParams
): Promise<ActionResponse<{
  answers: Answer[],
  totalAnswers: number,
  isNext: boolean
}>> {
  const validationResult = await action({
    params,
    schema: GetAnswersSchema,
  });

  if (validationResult instanceof Error) {
    return HandleError(validationResult) as unknown as ErrorResponse;
  }

  const { questionId, page = 1, pageSize = 10, filter } =validationResult.validatedData;
  const skip = (Number(page) - 1) * pageSize;
  const limit = Number(pageSize);

  try {
    const query = { question: questionId };

    let sortCriteria = {};
    switch (filter) {
      case "latest":
        sortCriteria = { createdAt: -1 };
        break;
      case "oldest":
        sortCriteria = { createdAt: 1 };
        break;
      case "popular":
        sortCriteria = { upvotes: -1 };
        break;
      default:
        sortCriteria = { createdAt: -1 };
    }

    const totalAnswers = await Answer.countDocuments(query);
    
    const answers = await Answer.find(query)
      .sort(sortCriteria)
      .skip(skip)   
      .limit(limit);

    return {
      success: true,
      data: {
        answers: JSON.parse(JSON.stringify(answers)),
        totalAnswers,
        isNext: page * pageSize < totalAnswers,
      },
    };
  } catch (error) {
    const finalError = error instanceof Error ? error : new Error(String(error));
    return HandleError(finalError) as unknown as ErrorResponse;
  }
}