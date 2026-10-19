"use server"
import mongoose from "mongoose"
import { revalidatePath, updateTag } from "next/cache"

import { action } from "@/server/action"
import { CACHE_TAGS } from "@/server/cache-tags"
import { IAnswer, Question, Answer, Vote } from "@/server/db";
import { HandleError } from "@/server/errors/error-handler"
import { RequestError, UnauthorizedError } from "@/server/errors/http-error"
import ROUTES from "@/shared/constants/route"
import { AnswerIdSchema, CreateAnswerSchema, DeleteAnswerSchema, EditAnswerSchema, GetAnswersSchema } from "@/shared/lib/validation";
import {
  ActionResponse,
  AnswerIdParams,
  CreateAnswerParams,
  DeleteAnswerParams,
  EditAnswerParams,
  ErrorResponse,
  GetAnswersParams,
} from "@/shared/types";


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
    // Atomic increment inside the transaction, so concurrent answers can't lose a count
    const question = await Question.findByIdAndUpdate(
      questionId,
      { $inc: { answers: 1 } },
      { session, projection: { _id: 1 } }
    );

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
    
    await session.commitTransaction();
    updateTag(CACHE_TAGS.questions);
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
  params: GetAnswersParams
): Promise<ActionResponse<{
  answers: IAnswer[],
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

  const { questionId, page = 1, pageSize = 10, filter } = validationResult.validatedData;
  const skip = (Number(page) - 1) * pageSize;
  const limit = Number(pageSize);

  try {
    const query = { question: questionId };

    let sortCriteria: Record<string, 1 | -1>;
    switch (filter) {
      case "latest":
        sortCriteria = { createdAt: -1, _id: -1 };
        break;
      case "oldest":
        sortCriteria = { createdAt: 1, _id: 1 };
        break;
      case "popular":
        sortCriteria = { upvotes: -1, createdAt: -1, _id: -1 };
        break;
      default:
        sortCriteria = { createdAt: -1, _id: -1 };
    }

    const totalAnswers = await Answer.countDocuments(query);
    
    const answers = await Answer.find(query)
      .populate({
        path: "author",
        select: "_id name image", // Populates the author properties required by your frontend components
      })
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

const toErrorResponse = (error: unknown) =>
  HandleError(error instanceof Error ? error : String(error)) as unknown as ErrorResponse;

export interface EditableAnswer {
  _id: string;
  content: string;
  author: string;
  question: { _id: string; title: string } | null;
}

/** Loads one answer for its edit page. Only the answer's author may load it. */
export async function getAnswerForEdit(
  params: AnswerIdParams
): Promise<ActionResponse<EditableAnswer>> {
  const validationResult = await action({
    params,
    schema: AnswerIdSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) return toErrorResponse(validationResult);

  const userId = validationResult.session?.user?.id;
  if (!userId) return toErrorResponse(new UnauthorizedError());

  try {
    const answer = await Answer.findById(validationResult.validatedData.answerId)
      .select("content author question")
      .populate("question", "_id title")
      .lean<{ _id: unknown; content: string; author: unknown; question: { _id: unknown; title: string } | null }>();

    if (!answer) throw new RequestError("This answer no longer exists.", 404);
    if (String(answer.author) !== userId) {
      throw new RequestError("You can only edit your own answers.", 403);
    }

    return { success: true, data: JSON.parse(JSON.stringify(answer)) };
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function editAnswer(
  params: EditAnswerParams
): Promise<ActionResponse<{ questionId: string }>> {
  const validationResult = await action({
    params,
    schema: EditAnswerSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) return toErrorResponse(validationResult);

  const userId = validationResult.session?.user?.id;
  if (!userId) return toErrorResponse(new UnauthorizedError());

  const { answerId, content } = validationResult.validatedData;

  try {
    // The author filter makes the ownership check and the update one atomic step
    const answer = await Answer.findOneAndUpdate(
      { _id: answerId, author: userId },
      { $set: { content } },
      { projection: { question: 1 } }
    ).lean<{ question: unknown } | null>();

    if (!answer) {
      const exists = await Answer.exists({ _id: answerId });
      throw exists
        ? new RequestError("You can only edit your own answers.", 403)
        : new RequestError("This answer no longer exists.", 404);
    }

    const questionId = String(answer.question);
    revalidatePath(ROUTES.QUESTION(questionId));
    revalidatePath(ROUTES.PROFILE(userId));

    return { success: true, data: { questionId } };
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function deleteAnswer(params: DeleteAnswerParams): Promise<ActionResponse> {
  const validationResult = await action({
    params,
    schema: DeleteAnswerSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) return toErrorResponse(validationResult);

  const userId = validationResult.session?.user?.id;
  if (!userId) return toErrorResponse(new UnauthorizedError());

  const { answerId } = validationResult.validatedData;
  const session = await mongoose.startSession();

  try {
    let questionId = "";

    // withTransaction commits on success, aborts on any throw and retries transient errors
    await session.withTransaction(async () => {
      const answer = await Answer.findById(answerId)
        .select("author question")
        .session(session)
        .lean<{ author: mongoose.Types.ObjectId; question: mongoose.Types.ObjectId } | null>();

      if (!answer) throw new RequestError("This answer no longer exists.", 404);
      if (String(answer.author.toString()) !== userId) {
        throw new RequestError("You can only delete your own answers.", 403);
      }

      questionId = String(answer.question);

      // Votes are stored as { id, type }
      await Vote.deleteMany({ id: answerId, type: "answer" }, { session });
      await Answer.findByIdAndDelete({ _id: answerId }, { session,new: true });
   
      await Question.findOneAndUpdate(
        { _id: answer.question, answers: { $gt: 0 } },
        { $inc: { answers: -1 } },
        { session, new: true }
      );
    });

    // Answer counts show on the cached question lists
    updateTag(CACHE_TAGS.questions);
    revalidatePath(ROUTES.QUESTION(questionId));
    revalidatePath(ROUTES.PROFILE(userId));

    return { success: true };
  } catch (error) {
    return toErrorResponse(error);
  } finally {
    await session.endSession();
  }
}
