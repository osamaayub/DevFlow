import { ImageIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { ReactNode } from "react"

import type { Job } from "@/features/jobs/types"
import { resolveCompanyJobUrl } from "@/features/jobs/utils"
import { Badge } from "@/shared/components/ui/badge"
import ROUTES from "@/shared/constants/route"

const JobCard = ({
  _id,
  title,
  company,
  companyLogo,
  applicationUrl,
  category,
  description,
  employmentType,
  salaryRange,
  location,
  extra,
}: Job & { extra?: ReactNode }) => {
  const isAustralia = /au\b|australia/i.test(location || "")
  const jobLink = resolveCompanyJobUrl(applicationUrl, company, ROUTES.JOBS_DETAILS(_id))
  const isExternal = jobLink.startsWith("http://") || jobLink.startsWith("https://")

  return (
    <article className="card-wrapper light-border relative flex flex-col justify-between rounded-[10px] border p-6 sm:px-8 sm:py-7">
      <div className="flex items-start gap-4 sm:gap-6">
        {companyLogo ? (
          <div className="background-light800_dark400 flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl sm:size-16">
            <Image
              src={companyLogo}
              alt={`${company} logo`}
              width={64}
              height={64}
              loading="lazy"
              sizes="64px"
              unoptimized
              className="size-full object-contain p-1"
            />
          </div>
        ) : (
          <div className="background-light800_dark400 flex size-14 shrink-0 items-center justify-center rounded-xl sm:size-16">
            <ImageIcon className="size-5 text-light-400 sm:size-6" aria-label={`${company} logo`} />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
            <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
              <h2 className="sm:h3-semibold base-semibold text-dark200_light900 min-w-0 break-words">{title}</h2>
              <Badge className="background-light800_dark400 text-light400_light500 rounded-md border-0 px-2.5 py-0.5 text-[10px] font-medium uppercase">
                {category}
              </Badge>
            </div>
            <span className="background-light800_dark400 text-dark400_light700 body-medium inline-flex min-w-0 items-center gap-1.5 rounded-full px-3 py-1">
              <Image
                src={isAustralia ? "/icons/au.svg" : "/icons/carbon-location.svg"}
                alt="location"
                width={16}
                height={16}
                className={isAustralia ? "rounded-full" : "invert-colors"}
              />
              <span className="break-words">{location}</span>
            </span>
          </div>

          <p className="body-regular text-dark500_light700 mt-2 line-clamp-2 max-w-2xl">{description}</p>

          {extra && <div className="mt-4 flex flex-wrap items-center gap-3">{extra}</div>}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 sm:mt-5">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <span className="body-medium text-light400_light500 inline-flex items-center gap-1.5">
                <Image
                  src="/icons/clock-2.svg"
                  alt="clock"
                  width={16}
                  height={16}
                />
                <span className="capitalize">{employmentType}</span>
              </span>
              <span className="body-medium text-light400_light500 inline-flex items-center gap-1.5">
                <Image
                  src="/icons/currency-dollar-circle.svg"
                  alt="salary"
                  width={16}
                  height={16}
                />
                <span>{salaryRange}</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {isExternal ? (
                <a
                  href={jobLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="body-semibold inline-flex items-center gap-1.5 text-primary-500 hover:underline"
                >
                  View job
                  <Image
                    src="/icons/arrow-up-right.svg"
                    alt="arrow up right"
                    width={16}
                    height={16}
                  />
                </a>
              ) : (
                <Link
                  href={jobLink}
                  className="body-semibold inline-flex items-center gap-1.5 text-primary-500 hover:underline"
                >
                  View job
                  <Image
                    src="/icons/arrow-up-right.svg"
                    alt="arrow up right"
                    width={16}
                    height={16}
                  />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

export default JobCard
