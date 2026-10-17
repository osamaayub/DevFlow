import { ArrowLeft, Building2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"

import { getJobById } from "@/features/jobs/actions"
import { JobActions } from "@/features/jobs/components"
import { BackButton, Metric } from "@/shared/components/common"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import ROUTES from "@/shared/constants/route"
import { getTimeStamp } from "@/shared/lib/utils"
import { RouteParams } from "@/shared/types"

const JobDetails = async ({ params }: RouteParams) => {
  const { id } = await params
  const { success, data } = await getJobById({ jobId: id })

  if (!success || !data?.job) redirect("/404")

  const job = data.job
  return (
    <main className="mx-auto w-full max-w-5xl">
      <BackButton href={ROUTES.JOBS} />

      <section className="background-light900_dark200 light-border rounded-2xl border p-5 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="background-light800_dark300 light-border flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border sm:size-20">
            {job.companyLogo ? (
              <Image src={job.companyLogo} alt={`${job.company} logo`} width={60} height={60} className="size-14 object-contain" />
            ) : (
              <Building2 className="size-8 text-primary-500" aria-hidden="true" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="background-light800_dark300 text-dark400_light700 rounded-md border-0 px-2.5 py-1 text-[10px] font-semibold tracking-wide">{job.category}</Badge>
              <span className="small-regular text-dark400_light500">{job.company}</span>
            </div>
            <h1 className="h2-semibold text-dark200_light900 mt-2">{job.title}</h1>
            <p className="body-regular text-dark400_light500 mt-2">Find your next opportunity with {job.company}.</p>
          </div>

          <div className="w-full sm:w-44 sm:shrink-0">
            <JobActions jobId={job._id} />
          </div>
        </div>

        <div className="light-border mt-6 flex flex-wrap gap-x-5 gap-y-3 border-t pt-5">
          <Metric
            imgUrl="/icons/clock.svg"
            alt="Posted"
            value={`Posted ${getTimeStamp(new Date(job.postedDate))}`}
            title=""
            textStyles="small-regular text-dark400_light700"
          />
          <Metric
            imgUrl="/icons/suitcase.svg"
            alt="Employment type"
            value={job.employmentType}
            title="Employment Type"
            textStyles="small-regular text-dark400_light700"
          />
          <Metric
            imgUrl="/icons/currency-dollar-circle.svg"
            alt="Salary"
            value={job.salaryRange}
            title="Salary"
            textStyles="small-regular text-dark400_light700"
          />
          <Metric
            imgUrl="/icons/location.svg"
            alt="Location"
            value={job.location}
            title="Location"
            textStyles="small-regular text-dark400_light700"
          />
        </div>
      </section>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section className="background-light900_dark200 light-border rounded-2xl border p-5 sm:p-7">
          <h2 className="h3-semibold text-dark200_light900">About this role</h2>
          <p className="body-regular text-dark400_light500 mt-4 whitespace-pre-line leading-7">{job.description}</p>
        </section>

        <aside className="background-light900_dark200 light-border h-fit rounded-2xl border p-5">
          <h2 className="body-semibold text-dark200_light900">Job overview</h2>
          <dl className="mt-4 space-y-4">
            <div><dt className="subtle-regular text-dark400_light500">Company</dt><dd className="small-medium text-dark200_light900 mt-1">{job.company}</dd></div>
            <div><dt className="subtle-regular text-dark400_light500">Job type</dt><dd className="small-medium text-dark200_light900 mt-1">{job.employmentType}</dd></div>
            <div><dt className="subtle-regular text-dark400_light500">Category</dt><dd className="small-medium text-dark200_light900 mt-1">{job.category}</dd></div>
            <div><dt className="subtle-regular text-dark400_light500">Compensation</dt><dd className="small-medium text-dark200_light900 mt-1">{job.salaryRange}</dd></div>
          </dl>
          <Button asChild variant="outline" className="text-dark400_light700 mt-5 w-full">
            <Link href={ROUTES.JOBS}><ArrowLeft className="size-4" aria-hidden="true" /> Browse more jobs</Link>
          </Button>
        </aside>
      </div>
    </main>
  )
}

export default JobDetails
