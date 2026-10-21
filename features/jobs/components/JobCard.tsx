import { ArrowUpRight, CircleDollarSign, Clock3, ImageIcon, MapPin } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { ReactNode } from "react"

import type { Job } from "@/features/jobs/types"
import { Badge } from "@/shared/components/ui/badge"
import ROUTES from "@/shared/constants/route"

const JobCard = ({
  _id,
  title,
  company,
  companyLogo,
  category,
  description,
  employmentType,
  salaryRange,
  location,
  extra,
}: Job & { extra?: ReactNode }) => (
  <article className="card-wrapper light-border rounded-[10px] border p-5 sm:px-8 sm:py-7">
    <div className="flex items-start gap-4 sm:gap-6">
      {companyLogo ? (
        <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl sm:size-16">
          <Image src={companyLogo} alt={`${company} logo`} width={64} height={64} loading="lazy" sizes="64px" unoptimized className="size-full object-contain" />
        </div>
      ) : (
        <div className="background-light800_dark400 flex size-12 shrink-0 items-center justify-center rounded-xl sm:size-16">
          <ImageIcon className="size-5 text-light-400 sm:size-6" aria-label={`${company} logo`} />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
            <h2 className="base-semibold text-dark200_light900 min-w-0 break-words">{title}</h2>
            <Badge className="background-light800_dark400 text-light400_light500 rounded-md border-0 px-3 py-1 text-[10px] font-medium uppercase">
              {category}
            </Badge>
          </div>
          <span className="background-light800_dark400 text-dark400_light700 body-medium inline-flex min-w-0 items-center gap-2 rounded-full px-3 py-1.5">
            <MapPin className="size-4 shrink-0 text-primary-500" aria-hidden="true" />
            <span className="break-words">{location}</span>
          </span>
        </div>

        <p className="body-regular text-dark500_light700 mt-2 line-clamp-2 max-w-xl">{description}</p>

        {extra && <div className="mt-4 flex flex-wrap items-center gap-3">{extra}</div>}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="body-medium text-light400_light500 inline-flex items-center gap-1.5">
              <Clock3 className="size-4" aria-hidden="true" />
              {employmentType}
            </span>
            <span className="body-medium text-light400_light500 inline-flex items-center gap-1.5">
              <CircleDollarSign className="size-4" aria-hidden="true" />
              {salaryRange}
            </span>
          </div>
          <Link
            href={ROUTES.JOBS_DETAILS(_id)}
            className="body-semibold inline-flex items-center gap-1.5 text-primary-500 hover:underline"
          >
            View job <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  </article>
)

export default JobCard
