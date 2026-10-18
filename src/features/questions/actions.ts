"use server";

import mongoose, { FilterQuery } from "mongoose";
import { revalidatePath, unstable_cache, updateTag } from "next/cache";
import { cache } from "react";

import { insertQuestion } from "@/features/questions/service"
import { PopulatedTag, processTags, removeTags } from "@/features/tags/tag-helpers"
import { action } from "@/server/action"
import { CACHE_REVALIDATE_SECONDS, CACHE_TAGS } from "@/server/cache-tags"
import { Answer, Collection, Vote, Question, TagQuestion, Tag } from "@/server/db";
import dbConnect from "@/server/db/connect";
import { HandleError } from "@/server/errors/error-handler"
import { RequestError, UnauthorizedError } from "@/server/errors/http-error"
import ROUTES from "@/shared/constants/route"
import { AskQuestionSchema, DeleteQuestionSchema, EditQuestionSchema, GetQuestionSchema, IncrementQuestionViewsSchema, paginatedSearchParamsSchema } from "@/shared/lib/validation"
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
} from "@/shared/types";

const normalizeAuthorId = (author: unknown): string | undefined => {
  if (!author) return undefined;

  if (typeof author === "string") return author;

  if (typeof author === "object") {
    const authorRecord = author as { _id?: unknown; id?: unknown };
    if (authorRecord._id != null) return String(authorRecord._id);
    if (authorRecord.id != null) return String(authorRecord.id);
  }

  return String(author);
};

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

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getQuestionSortCriteria = (
  filter?: string
): { sort: Record<string, 1 | -1>; unansweredOnly: boolean } => {
  switch (filter) {
    case "popular":
      return { sort: { upvotes: -1, createdAt: -1 }, unansweredOnly: false };
    case "unanswered":
      return { sort: { createdAt: -1 }, unansweredOnly: true };
    case "recommended":
      return { sort: { upvotes: -1, createdAt: -1 }, unansweredOnly: false };
    case "frequent":
      return { sort: { views: -1, createdAt: -1 }, unansweredOnly: false };
    case "newest":
    default:
      return { sort: { createdAt: -1 }, unansweredOnly: false };
  }
};

// Question lists are read on almost every page (home feed + right sidebar), so they are
// cached per (page, pageSize, query, filter) and invalidated by the questions tag
const getCachedQuestionList = unstable_cache(
  async (page: number, pageSize: number, query: string, filter: string) => {
    await dbConnect();

    const skip = (page - 1) * pageSize;
    const { sort, unansweredOnly } = getQuestionSortCriteria(filter);
    const filterQuery: FilterQuery<typeof Question> = {};

    if (query) {
      const pattern = new RegExp(escapeRegex(query), "i");
      filterQuery.$or = [{ title: pattern }, { content: pattern }];
    }
    if (unansweredOnly) filterQuery.answers = 0;

    // Fetching one extra row tells us whether a next page exists without a count query
    const questions = await Question.find(filterQuery)
      .select("-content")
      .populate("tags", "name")
      .populate("author", "name image")
      .sort(sort)
      .skip(skip)
      .limit(pageSize + 1)
      .lean();

    return {
      questions: JSON.parse(JSON.stringify(questions.slice(0, pageSize))) as QuestionType[],
      isNext: questions.length > pageSize,
    };
  },
  ["question-list"],
  { tags: [CACHE_TAGS.questions], revalidate: CACHE_REVALIDATE_SECONDS.questions }
);

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

      if (normalizeAuthorId(question.author) !== userId) {
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
