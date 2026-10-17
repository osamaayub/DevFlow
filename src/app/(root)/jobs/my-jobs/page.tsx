import { Users } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

import { getAppliedJobs, getPostedJobs, getSavedJobs } from "@/features/jobs/actions"
import {
  ApplicationStatusBadge,
  JobCard,
  MyJobsTabs,
  SaveJob,
  WithdrawApplication,
  type MyJobsTab,
} from "@/features/jobs/components"
import { auth } from "@/server/auth"
import { BackButton, DataRender } from "@/shared/components/common"
import { Pagination } from "@/shared/components/navigation"
import ROUTES from "@/shared/constants/route"
import {
  EMPTY_APPLIED_JOBS,
  EMPTY_POSTED_JOBS,
  EMPTY_SAVED_JOBS,
} from "@/shared/constants/states"
import { getTimeStamp } from "@/shared/lib/utils"
import { RouteParams } from "@/shared/types"

const MyJobs = async ({ searchParams }: RouteParams) => {
  const session = await auth()
  if (!session?.user?.id) redirect(ROUTES.SIGN_IN)

  const { tab, page } = (await searchParams) || {}
  const activeTab: MyJobsTab = tab === "saved" || tab === "posted" ? tab : "applied"
  const pageNumber = Number(page) || 1
  const listParams = { page: pageNumber, pageSize: 10 }

  return (
    <div>
      <div className="flex flex-col gap-2">
        <BackButton href={ROUTES.JOBS} />
        <h1 className="h1-bold text-dark100_light900">My Jobs</h1>
        <p className="body-regular text-dark400_light500">
          Track your applications, jobs you saved for later, and jobs you&apos;ve posted.
        </p>
      </div>

      <div className="mt-8">
        <MyJobsTabs activeTab={activeTab} />
      </div>

      {activeTab === "applied" && <AppliedJobsList params={listParams} />}
      {activeTab === "saved" && <SavedJobsList params={listParams} />}
      {activeTab === "posted" && <PostedJobsList params={listParams} />}
    </div>
  )
}

type ListParams = { page: number; pageSize: number }

const AppliedJobsList = async ({ params }: { params: ListParams }) => {
  const { success, data, error } = await getAppliedJobs(params)

  return (
    <>
      <DataRender
        success={success}
        data={data?.applications}
        empty={EMPTY_APPLIED_JOBS}
        error={error}
        render={(applications) => (
          <div className="mt-8 flex flex-col gap-5 sm:gap-8">
            {applications.map(({ _id, job, status, appliedAt }) => (
              <JobCard
                key={_id}
                {...job}
                extra={
                  <>
                    <ApplicationStatusBadge status={status} />
                    <span className="small-regular text-light400_light500">
                      Applied {getTimeStamp(appliedAt)}
                    </span>
                    {(status === "submitted" || status === "reviewing") && (
                      <WithdrawApplication jobId={job._id} />
                    )}
                  </>
                }
              />
            ))}
          </div>
        )}
      />
      <Pagination pageNumber={params.page} isNext={data?.isNext || false} />
    </>
  )
}

const SavedJobsList = async ({ params }: { params: ListParams }) => {
  const { success, data, error } = await getSavedJobs(params)

  return (
    <>
      <DataRender
        success={success}
        data={data?.savedJobs}
        empty={EMPTY_SAVED_JOBS}
        error={error}
        render={(savedJobs) => (
          <div className="mt-8 flex flex-col gap-5 sm:gap-8">
            {savedJobs.map(({ _id, job, savedAt }) => (
              <JobCard
                key={_id}
                {...job}
                extra={
                  <>
                    <SaveJob jobId={job._id} />
                    <span className="small-regular text-light400_light500">
                      Saved {getTimeStamp(savedAt)}
                    </span>
                  </>
                }
              />
            ))}
          </div>
        )}
      />
      <Pagination pageNumber={params.page} isNext={data?.isNext || false} />
    </>
  )
}

const PostedJobsList = async ({ params }: { params: ListParams }) => {
  const { success, data, error } = await getPostedJobs(params)

  return (
    <>
      <DataRender
        success={success}
        data={data?.jobs}
        empty={EMPTY_POSTED_JOBS}
        error={error}
        render={(jobs) => (
          <div className="mt-8 flex flex-col gap-5 sm:gap-8">
            {jobs.map(({ applicantCount, ...job }) => (
              <JobCard
                key={job._id}
                {...job}
                extra={
                  <>
                    <Link
                      href={ROUTES.JOBS_APPLICANTS(job._id)}
                      className="body-semibold primary-gradient inline-flex items-center gap-2 rounded-lg px-4 py-2 text-light-900 hover:opacity-90"
                    >
                      <Users className="size-4" aria-hidden="true" />
                      {applicantCount} {applicantCount === 1 ? "applicant" : "applicants"}
                    </Link>
                    <span className="small-regular text-light400_light500">
                      Posted {getTimeStamp(job.postedDate)}
                    </span>
                  </>
                }
              />
            ))}
          </div>
        )}
      />
      <Pagination pageNumber={params.page} isNext={data?.isNext || false} />
    </>
  )
}

export default MyJobs
