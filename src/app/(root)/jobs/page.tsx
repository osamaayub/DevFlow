import { getJobs } from "@/features/jobs/actions"
import {
  JobCard,
  JobSearchControls,
} from "@/features/jobs/components"
import { DataRender } from "@/shared/components/common"
import { Pagination } from "@/shared/components/navigation"
import { EMPTY_JOBS } from "@/shared/constants/states"
import { RouteParams } from "@/shared/types"


const Jobs = async ({ searchParams }: RouteParams) => {
  const resolvedSearchParams = await searchParams
  const { page, pageSize, query, filter, location, category } = resolvedSearchParams || {}
  const pageNumber = Number(page) || 1

  const { success, data, error } = await getJobs({
    page: pageNumber,
    pageSize: Number(pageSize) || 10,
    query: typeof query === "string" ? query : undefined,
    filter: typeof filter === "string" ? filter : undefined,
    location: typeof location === "string" ? location : undefined,
    category: typeof category === "string" ? category : undefined,
  })

  const { jobs, isNext, totalJobs } = data || {}

  return (
    <div>
      <h1 className="h3-semibold text-dark200_light900">Jobs</h1>
      <JobSearchControls locations={data?.locations || []} />

      <div className="mt-8 flex items-center justify-end border-b border-light-800 pb-4 dark:border-dark-300">
        <p className="small-regular text-dark400_light500" aria-live="polite">
          {totalJobs ?? 0} {totalJobs === 1 ? "job" : "jobs"} found
        </p>
      </div>

      <DataRender
        success={success}
        data={jobs}
        empty={EMPTY_JOBS}
        error={error}
        render={(jobs) => (
          <div className="mt-12 flex flex-col gap-6">
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
