import { CheckCircle2, ExternalLink } from "lucide-react"
import Link from "next/link"

import ROUTES from "@/shared/constants/route"

const buttonClasses =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold transition-opacity"

interface ApplyJobProps {
  jobId: string
  hasApplied: boolean
  isAuthenticated: boolean
}

const ApplyJob = ({ jobId, hasApplied, isAuthenticated }: ApplyJobProps) => {
  if (hasApplied) {
    return (
      <Link
        href={`${ROUTES.MY_JOBS}?tab=applied`}
        className={`${buttonClasses} background-light800_dark300 text-dark400_light700 hover:opacity-90`}
      >
        <CheckCircle2 className="size-4 text-green-500" aria-hidden="true" />
        Applied
      </Link>
    )
  }

  return (
    <Link
      href={isAuthenticated ? ROUTES.JOBS_APPLY(jobId) : ROUTES.SIGN_IN}
      className={`${buttonClasses} primary-gradient text-white hover:opacity-90`}
    >
      Apply now
      <ExternalLink className="size-4" aria-hidden="true" />
    </Link>
  )
}

export default ApplyJob
