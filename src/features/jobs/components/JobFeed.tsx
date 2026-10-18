"use client"

import { getJobs } from "@/features/jobs/actions"
import type { Job } from "@/features/jobs/types"
import { LoadMoreButton } from "@/shared/components/common"
import { useLoadMore } from "@/shared/hooks/useLoadMore"

import JobCard from "./JobCard"

interface JobFeedProps {
  initialJobs: Job[]
  initialHasMore: boolean
  initialPage: number
  pageSize: number
  query?: string
  filter?: string
  location?: string
  category?: string
}

/** Jobs list: server-rendered first page, then "Load more" appends the next pages. */
const JobFeed = ({
  initialJobs,
  initialHasMore,
  initialPage,
  pageSize,
  query,
  filter,
  location,
  category,
}: JobFeedProps) => {
  const { items, hasMore, isLoading, error, loadMore } = useLoadMore({
    initialItems: initialJobs,
    initialHasMore,
    initialPage,
    loadPage: async (page) => {
      const result = await getJobs({ page, pageSize, query, filter, location, category })
      if (!result.success || !result.data) {
        throw new Error(result.error?.message ?? "Couldn't load more jobs.")
      }
      return { items: result.data.jobs, hasMore: result.data.isNext }
    },
  })

  return (
    <>
      <div className="mt-8 flex flex-col gap-5 sm:mt-12 sm:gap-8">
        {items.map((job) => (
          <JobCard key={job._id} {...job} />
        ))}
      </div>
      <LoadMoreButton
        hasMore={hasMore}
        isLoading={isLoading}
        error={error}
        onLoadMore={loadMore}
        label="Load more jobs"
      />
    </>
  )
}

export default JobFeed
