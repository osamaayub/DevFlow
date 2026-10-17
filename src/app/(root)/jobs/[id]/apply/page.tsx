import { BriefcaseBusiness, CheckCircle2, CircleDollarSign, Clock3, MapPin } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"

import { getJobById, hasAppliedToJob } from "@/features/jobs/actions"
import { JobApplyForm } from "@/features/jobs/components"
import { auth } from "@/server/auth"
import { BackButton } from "@/shared/components/common"
import ROUTES from "@/shared/constants/route"
import { RouteParams } from "@/shared/types"

const ApplyToJob = async ({ params }: RouteParams) => {
  const { id } = await params
  const session = await auth()

  if (!session?.user?.id) redirect(ROUTES.SIGN_IN)

  const [{ success, data }, applicationResult] = await Promise.all([
    getJobById({ jobId: id }),
    hasAppliedToJob({ jobId: id }),
  ])

  if (!success || !data?.job) notFound()

  const { job } = data
  const alreadyApplied = applicationResult.success && applicationResult.data?.applied

  return (
    <div className="mx-auto w-full max-w-5xl">
      <BackButton href={ROUTES.JOBS_DETAILS(job._id)} />

      <h1 className="h1-bold text-dark100_light900 mt-2">Apply for this job</h1>
      <p className="body-regular text-dark400_light500 mt-2">
        Fill in your details below. Your application will be sent to {job.company}.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section className="background-light900_dark200 light-border rounded-2xl border p-5 sm:p-8">
          {alreadyApplied ? (
            <div className="flex flex-col items-center gap-4 py-10 text-center">
              <CheckCircle2 className="size-12 text-green-500" aria-hidden="true" />
              <h2 className="h3-semibold text-dark200_light900">You&apos;ve already applied</h2>
              <p className="body-regular text-dark400_light500 max-w-md">
                Your application for {job.title} has been submitted. You can track its status in My Jobs.
              </p>
              <Link
                href={`${ROUTES.MY_JOBS}?tab=applied`}
                className="primary-gradient body-semibold mt-2 rounded-lg px-6 py-3 text-light-900"
              >
                View my applications
              </Link>
            </div>
          ) : (
            <JobApplyForm
              jobId={job._id}
              defaultName={session.user.name ?? ""}
              defaultEmail={session.user.email ?? ""}
            />
          )}
        </section>

        <aside className="background-light900_dark200 light-border h-fit rounded-2xl border p-5 lg:sticky lg:top-28">
          <div className="flex items-center gap-3">
            <div className="background-light800_dark400 flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl">
              {job.companyLogo ? (
                <Image src={job.companyLogo} alt={`${job.company} logo`} width={48} height={48} unoptimized className="size-full object-contain" />
              ) : (
                <BriefcaseBusiness className="size-5 text-primary-500" aria-hidden="true" />
              )}
            </div>
            <div className="min-w-0">
              <p className="base-semibold text-dark200_light900 break-words">{job.title}</p>
              <p className="small-regular text-dark400_light500">{job.company}</p>
            </div>
          </div>

          <ul className="body-medium text-light400_light500 mt-5 space-y-3">
            <li className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0 text-primary-500" aria-hidden="true" />
              {job.location}
            </li>
            <li className="flex items-center gap-2">
              <Clock3 className="size-4 shrink-0" aria-hidden="true" />
              {job.employmentType}
            </li>
            <li className="flex items-center gap-2">
              <CircleDollarSign className="size-4 shrink-0" aria-hidden="true" />
              {job.salaryRange}
            </li>
          </ul>
        </aside>
      </div>
    </div>
  )
}

export default ApplyToJob
