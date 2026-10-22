import type { Metadata } from "next"

import { getJobs } from "@/features/jobs/actions"
import { JobCard, JobSearchControls } from "@/features/jobs/components"
import { BackButton, DataRender } from "@/shared/components/common"
import { Pagination } from "@/shared/components/navigation"
import { EMPTY_JOBS } from "@/shared/constants/states"
import { RouteParams } from "@/shared/types"

export const metadata: Metadata = {
  title: "Developer Jobs",
  description: "Find developer jobs and technology opportunities shared with the DevFlow community.",
  alternates: { canonical: "/jobs" }
}


const Jobs = async ({ searchParams }: RouteParams) => {
  const resolvedSearchParams = await searchParams
  const { page, pageSize, query, filter, location, category } = resolvedSearchParams || {}
  const pageNumber = Number(page) || 1
  const listParams = {
    pageSize: Number(pageSize) || 10,
    query: typeof query === "string" ? query : undefined,
    filter: typeof filter === "string" ? filter : undefined,
    location: typeof location === "string" ? location : undefined,
    category: typeof category === "string" ? category : undefined,
  }

  const { success, data, error } = await getJobs({ page: pageNumber, ...listParams })

  const { jobs, isNext } = data || {}

  return (
    <div>
      <div className="flex flex-col gap-2">
        <BackButton />
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="h1-bold text-dark100_light900">Jobs</h1>
        </div>
      </div>
      <JobSearchControls locations={data?.locations || []} />

      <DataRender
        success={success}
        data={jobs}
        empty={EMPTY_JOBS}
        error={error}
        render={(jobs) => (
          <div className="mt-8 flex flex-col gap-5 sm:mt-12 sm:gap-8">
            {jobs.map((job) => (
              <JobCard key={job._id} {...job} />
            ))}
          </div>
        )}
      />

      <Pagination pageNumber={pageNumber} isNext={isNext || false} />
    </div>
  )
}

export default Jobs
