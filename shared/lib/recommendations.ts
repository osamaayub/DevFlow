import mongoose, { FilterQuery } from "mongoose";

import { Interaction, Question } from "@/server/db";
import type { Question as QuestionType } from "@/shared/types";

const RECOMMENDATION_TAG_LIMIT = 10;
const RECOMMENDATION_SORT = { upvotes: -1 as const, views: -1 as const };

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getInteractedQuestionIds = async (
  userId: string
): Promise<mongoose.Types.ObjectId[]> => {
  const questionIds = await Interaction.distinct("actionId", {
    user: userId,
    actionType: "question",
    actionId: { $exists: true },
  });

  return questionIds
    .filter((questionId) => mongoose.isValidObjectId(questionId))
    .map((questionId) => new mongoose.Types.ObjectId(questionId));
};

export const getPreferredTagIds = async (
  questionIds: mongoose.Types.ObjectId[]
): Promise<mongoose.Types.ObjectId[]> => {
  if (questionIds.length === 0) return [];

  const tags = await Question.aggregate<{ _id: mongoose.Types.ObjectId }>([
    { $match: { _id: { $in: questionIds } } },
    { $unwind: "$tags" },
    { $group: { _id: "$tags", questionCount: { $sum: 1 } } },
    { $sort: { questionCount: -1 } },
    { $limit: RECOMMENDATION_TAG_LIMIT },
  ]);

  return tags.map(({ _id }) => _id);
};

export const getRecommendationFilter = (
  userId: string,
  interactedQuestionIds: mongoose.Types.ObjectId[],
  query?: string
): FilterQuery<typeof Question> => {
  const filter: FilterQuery<typeof Question> = {
    author: { $ne: userId },
  };

  if (interactedQuestionIds.length > 0) {
    filter._id = { $nin: interactedQuestionIds };
  }

  if (query) {
    const pattern = new RegExp(escapeRegex(query), "i");
    filter.$or = [{ title: pattern }, { content: pattern }];
  }

  return filter;
};

export const findRecommendationQuestions = async (
  filter: FilterQuery<typeof Question>,
  skip: number,
  limit: number
) => Question.find(filter)
  .select("-content")
  .populate("tags", "name")
  .populate("author", "name image")
  .sort(RECOMMENDATION_SORT)
  .skip(skip)
  .limit(limit)
  .lean();

export const serializeRecommendationQuestions = (
  questions: unknown[]
): QuestionType[] => {
  const serializedQuestions = JSON.parse(JSON.stringify(questions)) as QuestionType[];

  return serializedQuestions.map((question) => ({
    ...question,
    tags: Array.from(
      new Map((question.tags ?? []).map((tag) => [tag._id, tag])).values()
    ),
  }));
};
