import { FilterQuery } from "mongoose";
import { cacheLife, cacheTag } from "next/cache";

import { CACHE_TAGS } from "@/server/cache-tags";
import { Question } from "@/server/db";
import dbConnect from "@/server/db/connect";
import type { Question as QuestionType } from "@/shared/types";

export const normalizeAuthorId = (author: unknown): string | undefined => {
  if (!author) return undefined;
  if (typeof author === "string") return author;

  if (typeof author === "object") {
    const authorRecord = author as { _id?: unknown; id?: unknown };
    if (authorRecord._id != null) return String(authorRecord._id);
    if (authorRecord.id != null) return String(authorRecord.id);
  }

  return String(author);
};

export const getQuestionSortCriteria = (
  filter?: string
): { sort: Record<string, 1 | -1>; unansweredOnly: boolean } => {
  switch (filter) {
    case "popular":
      return { sort: { upvotes: -1, createdAt: -1 }, unansweredOnly: false };
    case "unanswered":
      return { sort: { createdAt: -1 }, unansweredOnly: true };
    case "frequent":
      return { sort: { views: -1, createdAt: -1 }, unansweredOnly: false };
    case "recommended":
      return { sort: { upvotes: -1, createdAt: -1 }, unansweredOnly: false };
    case "newest":
    default:
      return { sort: { createdAt: -1 }, unansweredOnly: false };
  }
};

export async function getCachedQuestionList(
  page: number,
  pageSize: number,
  query: string,
  filter: string
) {
  "use cache"
  cacheLife("minutes")
  cacheTag(CACHE_TAGS.questions)

  await dbConnect();

  const skip = (page - 1) * pageSize;
  const { sort, unansweredOnly } = getQuestionSortCriteria(filter);
  const filterQuery: FilterQuery<typeof Question> = {};

  if (query) {
    filterQuery.$text = { $search: query };
  }
  if (unansweredOnly) filterQuery.answers = 0;

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
}
