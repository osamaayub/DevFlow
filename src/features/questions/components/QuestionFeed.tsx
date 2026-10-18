"use client"

import { getSaveQuestions } from "@/features/collections/actions"
import { getCommunityMember } from "@/features/community/actions"
import { getQuestions } from "@/features/questions/actions"
import { getTagQuestions } from "@/features/tags/actions"
import { LoadMoreButton } from "@/shared/components/common"
import { useLoadMore, type LoadMorePage } from "@/shared/hooks/useLoadMore"
import type { Question } from "@/shared/types"

import QuestionCard from "./QuestionCard"

/** Which list the feed pages through. Each kind maps to its existing server loader. */
export type QuestionFeedSource =
  | { kind: "all"; query?: string; filter?: string }
  | { kind: "tag"; tagId: string; query?: string; filter?: string }
  | { kind: "saved"; query?: string; filter?: string; tag?: string }
  | { kind: "member"; userId: string }

interface QuestionFeedProps {
  source: QuestionFeedSource
  initialQuestions: Question[]
  initialHasMore: boolean
  initialPage: number
  pageSize: number
  showSavedIcon?: boolean
  className?: string
}

const loadQuestionPage = async (
  source: QuestionFeedSource,
  page: number,
  pageSize: number
): Promise<LoadMorePage<Question>> => {
  const fail = (message?: string): never => {
    throw new Error(message ?? "Couldn't load more questions.")
  }

  switch (source.kind) {
    case "all": {
      const result = await getQuestions({ page, pageSize, query: source.query, filter: source.filter })
      if (!result.success || !result.data) return fail(result.error?.message)
      return { items: result.data.questions, hasMore: result.data.isNext }
    }
    case "tag": {
      const result = await getTagQuestions({
        tagId: source.tagId,
        page,
        pageSize,
        query: source.query,
        filter: source.filter,
      })
      if (!result.success || !result.data) return fail(result.error?.message)
      return { items: result.data.questions as unknown as Question[], hasMore: result.data.isNext }
    }
    case "saved": {
      const result = await getSaveQuestions({
        page,
        pageSize,
        query: source.query ?? "",
        filter: source.filter ?? "",
        tag: source.tag ?? "",
      })
      if (!result.success || !result.data) return fail(result.error?.message)
      return { items: result.data.questions, hasMore: result.data.isNext }
    }
    case "member": {
      const result = await getCommunityMember({ userId: source.userId, page, pageSize })
      if (!result.success || !result.data) return fail(result.error?.message)
      return { items: result.data.questions, hasMore: result.data.isNext }
    }
  }
}

/**
 * A question list that shows the server-rendered first page, then appends the next page
 * each time "Load more" is clicked. Give it a `key` built from its filters so a new search
 * or filter starts the list over.
 */
const QuestionFeed = ({
  source,
  initialQuestions,
  initialHasMore,
  initialPage,
  pageSize,
  showSavedIcon = false,
  className = "mt-10",
}: QuestionFeedProps) => {
  const { items, hasMore, isLoading, error, loadMore } = useLoadMore({
    initialItems: initialQuestions,
    initialHasMore,
    initialPage,
    loadPage: (page) => loadQuestionPage(source, page, pageSize),
  })

  return (
    <>
      <div className={`${className} flex w-full flex-col gap-6`}>
        {items.map((question) => (
          <QuestionCard key={question._id} question={question} showSavedIcon={showSavedIcon} />
        ))}
      </div>
      <LoadMoreButton
        hasMore={hasMore}
        isLoading={isLoading}
        error={error}
        onLoadMore={loadMore}
        label="Load more questions"
      />
    </>
  )
}

export default QuestionFeed
