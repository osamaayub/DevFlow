import { ArrowUpRight, BriefcaseBusiness, Clock3, MapPin } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

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
}: Job) => (
  <article className="card-wrapper light-border rounded-[10px] border p-6 transition-shadow hover:shadow-md sm:p-8">
    <div className="flex items-start gap-4">
      <div className="background-light800_dark300 light-border flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border sm:size-14">
        {companyLogo ? (
          <Image src={companyLogo} alt={`${company} logo`} width={42} height={42} className="size-10 object-contain" />
        ) : (
          <BriefcaseBusiness className="size-5 text-primary-500" aria-hidden="true" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h2 className="body-semibold text-dark200_light900 text-base">{title}</h2>
            <Badge className="background-light800_dark300 text-primary-500 rounded-md border-0 px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase">
              {category}
            </Badge>
          </div>
          <span className="text-primary-500 inline-flex shrink-0 items-center gap-1 text-xs font-medium">
            <MapPin className="size-3.5" aria-hidden="true" />{location}
          </span>
        </div>

        <p className="small-regular text-dark400_light500 mt-1">{company}</p>
        <p className="small-regular text-dark400_light500 mt-2 line-clamp-2">{description}</p>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="small-regular text-dark400_light500 inline-flex items-center gap-1.5"><Clock3 className="size-3.5" aria-hidden="true" />{employmentType}</span>
            <span className="small-regular text-dark400_light500 inline-flex items-center gap-1.5"><span className="text-primary-500" aria-hidden="true">$</span>{salaryRange}</span>
          </div>
          <Link href={ROUTES.JOBS_DETAILS(_id)} className="small-semibold inline-flex items-center gap-1 text-primary-500 hover:underline">
            View job <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  </article>
)

export default JobCard
