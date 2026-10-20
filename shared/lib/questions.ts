import { FilterQuery } from "mongoose";
import { unstable_cache } from "next/cache";

import { CACHE_REVALIDATE_SECONDS, CACHE_TAGS } from "@/server/cache-tags";
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

export const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

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

export const getCachedQuestionList = unstable_cache(
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
