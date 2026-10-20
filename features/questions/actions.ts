"use server";

import mongoose, { FilterQuery } from "mongoose";
import { revalidatePath, revalidateTag, updateTag } from "next/cache";
import { after } from "next/server";
import { cache } from "react";

import { createInteraction } from "@/features/interaction/action"
import { insertQuestion } from "@/features/questions/service"
import { PopulatedTag, processTags, removeTags } from "@/features/tags/tag-helpers"
import { action } from "@/server/action"
import { auth } from "@/server/auth"
import { CACHE_TAGS } from "@/server/cache-tags"
import { Answer, Collection, Vote, Question, TagQuestion, Tag } from "@/server/db";
import dbConnect from "@/server/db/connect";
import { HandleError } from "@/server/errors/error-handler"
import { RequestError, UnauthorizedError } from "@/server/errors/http-error"
import ROUTES from "@/shared/constants/route"
import logger from "@/shared/lib/logger";
import { getCachedQuestionList, normalizeAuthorId } from "@/shared/lib/questions"
import {
  findRecommendationQuestions,
  getInteractedQuestionIds,
  getPreferredTagIds,
  getRecommendationFilter,
  serializeRecommendationQuestions,
} from "@/shared/lib/recommendations"
import { AskQuestionSchema, DeleteQuestionSchema, EditQuestionSchema, GetQuestionSchema, GetRecommendationQuestionsSchema, IncrementQuestionViewsSchema, paginatedSearchParamsSchema } from "@/shared/lib/validation"
import {
  ActionResponse,
  CreateQuestionParams,
  DeleteQuestionParams,
  EditQuestionParams,
  ErrorResponse,
  GetQuestionParams,
  IncrementQuestionViewsParams,
  PaginatedSearchParams,
  Question as QuestionType,
  RecommendationParams,
} from "@/shared/types";

export async function createQuestion(
  params: CreateQuestionParams
): Promise<ActionResponse<QuestionType>> {
  const validationResult = await action({
    params,
    schema: AskQuestionSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return HandleError(validationResult) as unknown as ErrorResponse;
  }

  const userId = validationResult.session?.user?.id;
  if (!userId) return HandleError(new UnauthorizedError()) as unknown as ErrorResponse;

  try {
    const question = await insertQuestion({ ...validationResult.validatedData, authorId: userId });

    after(async () => {
      const interaction = await createInteraction({
        action: "post",
        actionTarget: "question",
        actionId: String(question._id),
        authorId: userId,
      });
      if (!interaction.success) {
        logger.error({ questionId: question._id, error: interaction.error }, "Failed to record question post interaction");
      }
    });

    // Cache invalidation and the return stay outside after(): updateTag only works while the
    // action is running, and the form needs the created question back.
    updateTag(CACHE_TAGS.questions);
    updateTag(CACHE_TAGS.tags);
    revalidatePath(ROUTES.PROFILE(userId));

    return { success: true, data: question };
  } catch (error) {
    return HandleError(error instanceof Error ? error : String(error)) as unknown as ErrorResponse;
  }
}

export async function editQuestion(
  params: EditQuestionParams
): Promise<ActionResponse<QuestionType>> {
  await dbConnect();

  const validationResult = await action({
    params,
    schema: EditQuestionSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return HandleError(validationResult) as unknown as ErrorResponse;
  }

  const { title, content, tags, questionId } = validationResult.validatedData;
  const userId = validationResult.session?.user?.id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const question = await Question.findById(questionId).populate("tags");
    if (!question) throw new Error("Question not found");

    const questionAuthorId = normalizeAuthorId(question.author);
    if (!questionAuthorId || questionAuthorId !== userId) {
      throw new Error("You are not authorized to edit this question");
    }

    if (question.title !== title || question.content !== content) {
      question.title = title;
      question.content = content;
    }

    const questionTags = question.tags as unknown as PopulatedTag[];

    const tagsToAdd = tags.filter(
      (tag: string) =>
        !questionTags.some(
          (t: PopulatedTag) => t.name.toLowerCase() === tag.toLowerCase()
        )
    );

    const tagsToRemove = questionTags.filter(
      (tag: PopulatedTag) =>
        !tags.some((t: string) => t.toLowerCase() === tag.name.toLowerCase())
    );

    if (tagsToRemove.length > 0) {
      await removeTags(tagsToRemove, new mongoose.Types.ObjectId(questionId), session);

      const tagIdsToRemove = tagsToRemove.map((t: PopulatedTag) => t._id);
      const filteredTags = questionTags.filter(
        (tag: PopulatedTag) =>
          !tagIdsToRemove.some((id: mongoose.Types.ObjectId) => id.equals(tag._id))
      );
      question.tags = filteredTags as unknown as mongoose.Types.ObjectId[];
    }

    if (tagsToAdd.length > 0) {
      const { tagIds, tagQuestionDocuments } = await processTags(
        tagsToAdd,
        new mongoose.Types.ObjectId(questionId),
        session
      );

      if (tagQuestionDocuments.length > 0) {
        await TagQuestion.insertMany(tagQuestionDocuments, { session });
      }

      question.tags.push(...tagIds);
    }

    await question.save({ session });
    await session.commitTransaction();

    // Record the edit for activity history after the response is sent (edits earn no
    // reputation). questionAuthorId is the signed-in user, verified by the check above.
    after(async () => {
      const interaction = await createInteraction({
        action: "edit",
        actionTarget: "question",
        actionId: questionId,
        authorId: questionAuthorId,
      });
      if (!interaction.success) {
        logger.error({ questionId, error: interaction.error }, "Failed to record question edit interaction");
      }
    });

    updateTag(CACHE_TAGS.questions);
    updateTag(CACHE_TAGS.tags);
    revalidatePath(ROUTES.QUESTION(questionId));

    return { success: true, data: JSON.parse(JSON.stringify(question)) };
  } catch (error) {
    await session.abortTransaction();
    return HandleError(String(error)) as unknown as ErrorResponse;
  } finally {
    await session.endSession();
  }
}

export const getQuestion = cache(async function getQuestion(
  params: GetQuestionParams
): Promise<ActionResponse<QuestionType>> {
  await dbConnect();

  const validationResult = await action({
    params,
    schema: GetQuestionSchema,
  });

  if (validationResult instanceof Error) {
    return HandleError(validationResult) as unknown as ErrorResponse;
  }

  const { questionId } = validationResult.validatedData;

  try {
    const question = await Question.findById(questionId)
      .populate("tags", "_id name")
      .populate("author", "_id name image")
      .lean();

    if (!question) throw new Error("Question not found");

    return { success: true, data: JSON.parse(JSON.stringify(question)) };
  } catch (error) {
    return HandleError(String(error)) as unknown as ErrorResponse;
  }
});

export async function getRecommendationQuestions(
  params: RecommendationParams
): Promise<ActionResponse<QuestionType[]>> {
  const validationResult = await action({
    params,
    schema: GetRecommendationQuestionsSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return HandleError(validationResult) as unknown as ErrorResponse;
  }

  const { userId, query, skip, limit } = validationResult.validatedData;
  const authenticatedUserId = validationResult.session?.user?.id;

  if (!authenticatedUserId || authenticatedUserId !== userId) {
    return HandleError(new UnauthorizedError()) as unknown as ErrorResponse;
  }

  try {
    const offset = Number(skip);
    const pageSize = Number(limit);
    const interactedQuestionIds = await getInteractedQuestionIds(userId);
    const preferredTagIds = await getPreferredTagIds(interactedQuestionIds);
    const filter = getRecommendationFilter(userId, interactedQuestionIds, query);

    const personalizedFilter: FilterQuery<typeof Question> = {
      ...filter,
      ...(preferredTagIds.length > 0 && { tags: { $in: preferredTagIds } }),
    };

    let questions = await findRecommendationQuestions(personalizedFilter, offset, pageSize);

    // New users, or users whose preferred topics have no unseen questions, still get
    // useful recommendations from the general feed.
    if (questions.length === 0 && preferredTagIds.length > 0) {
      questions = await findRecommendationQuestions(filter, offset, pageSize);
    }

    return {
      success: true,
      data: serializeRecommendationQuestions(questions),
    };
  } catch (error) {
    return HandleError(String(error)) as unknown as ErrorResponse;
  }
}

// Keep the previous misspelled export working for existing callers.
export const getRecommmendedQuestions = getRecommendationQuestions;
export const getRecommendQuestions = getRecommendationQuestions;
export async function getQuestions(params: PaginatedSearchParams): Promise<
  ActionResponse<{
    questions: QuestionType[];
    isNext: boolean;
  }>
> {
  const validationResult = await action({
    params,
    schema: paginatedSearchParamsSchema,
  });

  if (validationResult instanceof Error) {
    return HandleError(validationResult) as unknown as ErrorResponse;
  }

  const { page = 1, pageSize = 10, query = "", filter = "" } = validationResult.validatedData;

  try {
    if (filter === "recommended") {
      const session = await auth();
      const userId = session?.user?.id;

      if (userId) {
        const recommendationResult = await getRecommendQuestions({
          userId,
          query,
          skip: String((page - 1) * pageSize),
          limit: String(pageSize + 1),
        });

        if (!recommendationResult.success) {
          return recommendationResult as unknown as ErrorResponse;
        }

        const recommendedQuestions = recommendationResult.data ?? [];

        return {
          success: true,
          data: {
            questions: recommendedQuestions.slice(0, pageSize),
            isNext: recommendedQuestions.length > pageSize,
          },
        };
      }
    }

    return { success: true, data: await getCachedQuestionList(page, pageSize, query, filter) };
  } catch (error) {
    return HandleError(String(error)) as unknown as ErrorResponse;
  }
}

export async function incrementQuestionViews(
  params: IncrementQuestionViewsParams
): Promise<ActionResponse<{ views: number }>> {
  await dbConnect();

  const validationResult = await action({
    params,
    schema: IncrementQuestionViewsSchema,
  });

  if (validationResult instanceof Error) {
    return HandleError(validationResult) as unknown as ErrorResponse;
  }

  const { questionId } = validationResult.validatedData;

  try {
    // $inc is atomic, so concurrent visits can't overwrite each other's count
    const question = await Question.findByIdAndUpdate(
      questionId,
      { $inc: { views: 1 } },
      { new: true, projection: { views: 1 } }
    ).lean<{ views: number } | null>();
    if (!question) throw new Error("Question not found");

    // View counts show on the cached question lists (home feed, sidebar). Expire them now so
    // the next visit shows the new count. This runs from after(), where updateTag isn't
    // available, so it uses revalidateTag with immediate expiry.
    revalidateTag(CACHE_TAGS.questions, { expire: 0 });

    return {
      success: true,
      data: { views: question.views },
    };
  } catch (error) {
    return HandleError(String(error)) as unknown as ErrorResponse;
  }
}

export async function getHotQuestions(): Promise<ActionResponse<QuestionType[]>> {
  try {
    await dbConnect();

    const questions = await Question.find()
      .sort({ views: -1, upvotes: -1 })
      .limit(5);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(questions)),
    };
  } catch (error) {
    return HandleError(String(error)) as unknown as ErrorResponse;
  }
}

export async function deleteQuestion(
  params: DeleteQuestionParams
): Promise<ActionResponse> {
  const validationResult = await action({
    params,
    schema: DeleteQuestionSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return HandleError(validationResult) as unknown as ErrorResponse;
  }

  const userId = validationResult.session?.user?.id;
  if (!userId) return HandleError(new UnauthorizedError()) as unknown as ErrorResponse;

  const { questionId } = validationResult.validatedData;
  const session = await mongoose.startSession();

  try {
    // withTransaction commits on success, aborts on any throw and retries transient errors
    await session.withTransaction(async () => {
      const question = await Question.findById(questionId)
        .select("author tags")
        .session(session);

      if (!question) {
        throw new RequestError("This question no longer exists.", 404);
      }

      if (normalizeAuthorId(question.author.toString()) !== userId) {
        throw new RequestError("You can only delete your own questions.", 403);
      }

      const answerIds = await Answer.find({ question: questionId })
        .distinct("_id")
        .session(session);

      // Operations on one transaction session must run sequentially
      await Collection.deleteMany({ question: questionId }, { session });
      await TagQuestion.deleteMany({ question: questionId }, { session });
      await Vote.deleteMany({ id: questionId, type: "question" }, { session });

      if (answerIds.length > 0) {
        await Vote.deleteMany(
          { id: { $in: answerIds }, type: "answer" },
          { session }
        );
        await Answer.deleteMany({ question: questionId }, { session });
      }

      if (question.tags.length > 0) {
        await Tag.updateMany(
          { _id: { $in: question.tags } },
          { $inc: { questions: -1 } },
          { session }
        );
      }

      await Question.deleteOne({ _id: questionId }, { session });
    });

    // Take back the question's post points (-5) after the response is sent. Only the
    // author can delete, so they are both the performer and the author.
    after(async () => {
      const interaction = await createInteraction({
        action: "delete",
        actionTarget: "question",
        actionId: questionId,
        authorId: userId,
      });
      if (!interaction.success) {
        logger.error({ questionId, error: interaction.error }, "Failed to record question delete interaction");
      }
    });

    updateTag(CACHE_TAGS.questions);
    updateTag(CACHE_TAGS.tags);
    revalidatePath(ROUTES.PROFILE(userId));

    return { success: true };
  } catch (error) {
    return HandleError(
      error instanceof Error ? error : String(error)
    ) as unknown as ErrorResponse;
  } finally {
    await session.endSession();
  }
}
