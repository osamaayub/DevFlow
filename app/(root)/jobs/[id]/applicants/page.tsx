import { ExternalLink, FileText, Mail, Phone } from "lucide-react"
import { notFound, redirect } from "next/navigation"

import { getJobApplicants } from "@/features/jobs/actions"
import { ApplicantStatusSelect } from "@/features/jobs/components"
import { auth } from "@/server/auth"
import { BackButton, DataRender } from "@/shared/components/common"
import { Pagination } from "@/shared/components/navigation"
import ROUTES from "@/shared/constants/route"
import { EMPTY_APPLICANTS } from "@/shared/constants/states"
import { getTimeStamp } from "@/shared/lib/utils"
import { RouteParams } from "@/shared/types"

const linkClasses = "body-medium inline-flex items-center gap-1.5 text-primary-500 hover:underline"

const JobApplicants = async ({ params, searchParams }: RouteParams) => {
  const { id } = await params
  const { page } = (await searchParams) || {}
  const pageNumber = Number(page) || 1
  const session = await auth()
  if (!session?.user?.id) redirect(ROUTES.SIGN_IN)

  const { success, data, error } = await getJobApplicants({ jobId: id, page: pageNumber })

  // Only the person who posted the job may see its applicants
  if (!success && (error?.message?.includes("Forbidden") || error?.message?.includes("Not Found"))) {
    notFound()
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <BackButton href={ROUTES.JOBS_DETAILS(id)} />

      <h1 className="h1-bold text-dark100_light900 mt-2">Applicants</h1>
      {data?.job && (
        <p className="body-regular text-dark400_light500 mt-2">
          {data.job.title} · {data.job.company} · {data.totalApplicants}{" "}
          {data.totalApplicants === 1 ? "applicant" : "applicants"}
        </p>
      )}

      <DataRender
        success={success}
        data={data?.applicants}
        empty={EMPTY_APPLICANTS}
        error={error}
        render={(applicants) => (
          <div className="mt-8 flex flex-col gap-5">
            {applicants.map((applicant) => (
              <article
                key={applicant._id}
                className="card-wrapper light-border rounded-[10px] border p-5 sm:px-8 sm:py-7"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h2 className="base-semibold text-dark200_light900 break-words">{applicant.applicantName}</h2>
                    <p className="small-regular text-light400_light500 mt-1">
                      Applied {getTimeStamp(applicant.appliedAt)}
                    </p>
                  </div>
                  <ApplicantStatusSelect applicationId={applicant._id} status={applicant.status} />
                </div>

                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                  <a href={`mailto:${applicant.applicantEmail}`} className={linkClasses}>
                    <Mail className="size-4" aria-hidden="true" />
                    {applicant.applicantEmail}
                  </a>
                  {applicant.phone && (
                    <a href={`tel:${applicant.phone}`} className={linkClasses}>
                      <Phone className="size-4" aria-hidden="true" />
                      {applicant.phone}
                    </a>
                  )}
                  {applicant.resumeUrl && (
                    <a href={applicant.resumeUrl} target="_blank" rel="noopener noreferrer" className={linkClasses}>
                      <FileText className="size-4" aria-hidden="true" />
                      Resume
                    </a>
                  )}
                  {applicant.portfolioUrl && (
                    <a href={applicant.portfolioUrl} target="_blank" rel="noopener noreferrer" className={linkClasses}>
                      <ExternalLink className="size-4" aria-hidden="true" />
                      Portfolio
                    </a>
                  )}
                </div>

                {applicant.coverLetter && (
                  <details className="group mt-4">
                    <summary className="body-semibold text-dark400_light700 cursor-pointer select-none">
                      Cover letter
                    </summary>
                    <p className="body-regular text-dark500_light700 mt-3 whitespace-pre-line leading-7">
                      {applicant.coverLetter}
                    </p>
                  </details>
                )}
              </article>
            ))}
          </div>
        )}
      />

      <Pagination pageNumber={pageNumber} isNext={data?.isNext || false} />
    </div>
  )
}

export default JobApplicants
