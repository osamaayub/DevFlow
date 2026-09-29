"use server";

import mongoose, { FilterQuery } from "mongoose";
import { revalidatePath } from "next/cache";
import { cache } from "react";

import { auth } from "@/auth";
import { Answer, Collection, Vote, Question, TagQuestion, Tag } from "@/database";
import {
  action,
  AskQuestionSchema,
  EditQuestionSchema,
  GetQuestionSchema,
  HandleError,
  IncrementQuestionViewsSchema,
  paginatedSearchParamsSchema,
  PopulatedTag,
  processTags,
  removeTags,
} from "@/lib";
import {
  ActionResponse,
  CreateQuestionParams,
  EditQuestionParams,
  ErrorResponse,
  GetQuestionParams,
  IncrementQuestionViewsParams,
  PaginatedSearchParams,
  Question as QuestionType,
} from "@/types";

import dbConnect from "../mongoose";

export async function createQuestion(
  params: CreateQuestionParams
): Promise<ActionResponse<QuestionType>> {
  await dbConnect();

  const validationResult = await action({
    params,
    schema: AskQuestionSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return HandleError(validationResult) as unknown as ErrorResponse;
  }

  const { title, content, tags } = validationResult.validatedData;
  const userId = validationResult.session?.user?.id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const [question] = await Question.create(
      [{ title, content, author: userId }],
      { session }
    );

    if (!question) throw new Error("Failed to create the question");

    const { tagIds, tagQuestionDocuments } = await processTags(
      tags,
      question._id as mongoose.Types.ObjectId,
      session
    );

    if (tagQuestionDocuments.length > 0) {
      await TagQuestion.insertMany(tagQuestionDocuments, { session });
    }

    await Question.findByIdAndUpdate(
      question._id,
      { $push: { tags: {$each: tagIds } } },
      { session }
    );

    await session.commitTransaction();

    return { success: true, data: JSON.parse(JSON.stringify(question)) };
  } catch (error) {
    await session.abortTransaction();
    return HandleError(String(error)) as unknown as ErrorResponse;
  } finally {
    await session.endSession();
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

    if (question.author.toString() !== userId) {
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
      .populate("author", "_id name image");

    if (!question) throw new Error("Question not found");

    return { success: true, data: JSON.parse(JSON.stringify(question)) };
  } catch (error) {
    return HandleError(String(error)) as unknown as ErrorResponse;
  }
});

export async function getQuestions(params: PaginatedSearchParams): Promise<
  ActionResponse<{
    questions: QuestionType[];
    isNext: boolean;
  }>
> {
  await dbConnect();

  const validationResult = await action({
    params,
    schema: paginatedSearchParamsSchema,
  });

  if (validationResult instanceof Error) {
    return HandleError(validationResult) as unknown as ErrorResponse;
  }

  const { page = 1, pageSize = 10, query, filter } = params;

  const skip = (Number(page) - 1) * pageSize;
  const limit = pageSize;

  const filterQuery: FilterQuery<typeof Question> = {};
  let sortCriteria = {};

  try {
    if (query) {
      filterQuery.$or = [
        { title: { $regex: query,$options: "i" } },
        { content: { $regex: query,$options: "i" } },
      ];
    }

    switch (filter) {
      case "newest":
        sortCriteria = { createdAt: -1 };
        break;
      case "unanswered":
        filterQuery.answers = 0;
        sortCriteria = { createdAt: -1 };
        break;
      case "popular":
        sortCriteria = { upvotes: -1 };
        break;
      default:
        sortCriteria = { createdAt: -1 };
        break;
    }

    const totalQuestions = await Question.countDocuments(filterQuery);

    const questions = await Question.find(filterQuery)
      .populate("tags", "name")
      .populate("author", "name image")
      .lean()
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit);

    const isNext = totalQuestions > skip + questions.length;

    return {
      success: true,
      data: {
        questions: JSON.parse(JSON.stringify(questions)),
        isNext,
      },
    };
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
    const question = await Question.findById(questionId);
    if (!question) throw new Error("Question not found");

    question.views += 1;
    await question.save();

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
  params: { questionId: string }
): Promise<ActionResponse> {
  await dbConnect();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { questionId } = params;
    const sessionAuth = await auth();
    const userId = sessionAuth?.user?.id;

    if (!userId) throw new Error("Unauthorized");

    const question = await Question.findById(questionId).session(session);
    if (!question) throw new Error("Question not found");

    if (question.author.toString() !== userId)
      throw new Error("You are not authorized to delete this question");

    await Collection.deleteMany({ question: questionId }).session(session);
    await TagQuestion.deleteMany({ question: questionId }).session(session);

    if (question.tags.length > 0) {
      await Tag.updateMany(
        { _id: { $in: question.tags } },
        { $inc: { questions: -1 } },
        { session }
      );
    }

    await Vote.deleteMany({
      actionId: questionId,
      actionType: "question",
    }).session(session);

    const answers = await Answer.find({ question: questionId }).session(session);

    if (answers.length > 0) {
      await Answer.deleteMany({ question: questionId }).session(session);

      await Vote.deleteMany({
        actionId: { $in: answers.map((answer) => answer._id) },
        actionType: "answer",
      }).session(session);
    }

    await Question.findByIdAndDelete(questionId).session(session);

    await session.commitTransaction();

    revalidatePath(`/profile/${userId}`);

    return { success: true };
  } catch (error) {
    await session.abortTransaction();
    return HandleError(String(error)) as unknown as ErrorResponse;
  } finally {
    session.endSession();
  }
}