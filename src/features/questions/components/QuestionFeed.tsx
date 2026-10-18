"use client"

import { getQuestions } from "@/features/questions/actions"
import { LoadMoreButton } from "@/shared/components/common"
import { useLoadMore } from "@/shared/hooks/useLoadMore"
import type { Question } from "@/shared/types"

import QuestionCard from "./QuestionCard"

interface QuestionFeedProps {
  initialQuestions: Question[]
  initialHasMore: boolean
  initialPage: number
  pageSize: number
  query?: string
  filter?: string
}

/** Home question list: server-rendered first page, then "Load more" appends the next pages. */
const QuestionFeed = ({
  initialQuestions,
  initialHasMore,
  initialPage,
  pageSize,
  query,
  filter,
}: QuestionFeedProps) => {
  const { items, hasMore, isLoading, error, loadMore } = useLoadMore({
    initialItems: initialQuestions,
    initialHasMore,
    initialPage,
    loadPage: async (page) => {
      const result = await getQuestions({ page, pageSize, query, filter })
      if (!result.success || !result.data) {
        throw new Error(result.error?.message ?? "Couldn't load more questions.")
      }
      return { items: result.data.questions, hasMore: result.data.isNext }
    },
  })

  return (
    <>
      <div className="mt-10 flex w-full flex-col gap-6">
        {items.map((question) => (
          <QuestionCard key={question._id} question={question} />
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
