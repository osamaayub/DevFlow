"use client"

import { CheckCircle2, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

import { hasAppliedToJob } from "@/features/jobs/actions"
import ROUTES from "@/shared/constants/route"

const buttonClasses =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold transition-opacity"

const ApplyJob = ({ jobId }: { jobId: string }) => {
  const session = useSession()
  const userId = session.data?.user?.id
  const [hasApplied, setHasApplied] = useState(false)
  const [isCheckingApplication, setIsCheckingApplication] = useState(true)

  useEffect(() => {
    if (session.status === "loading") return
    if (!userId) {
      setHasApplied(false)
      setIsCheckingApplication(false)
      return
    }

    let isActive = true
    setIsCheckingApplication(true)

    const loadApplicationState = async () => {
      try {
        const result = await hasAppliedToJob({ jobId })
        if (isActive) {
          setHasApplied(result.success && Boolean(result.data?.applied))
        }
      } catch {
        if (isActive) setHasApplied(false)
      } finally {
        if (isActive) setIsCheckingApplication(false)
      }
    }

    void loadApplicationState()
    return () => {
      isActive = false
    }
  }, [jobId, session.status, userId])

  if (isCheckingApplication) {
    return (
      <div
        role="status"
        aria-label="Checking application status"
        className="min-h-11 animate-pulse rounded-lg bg-light-800 dark:bg-dark-300"
      />
    )
  }

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
      href={userId ? ROUTES.JOBS_APPLY(jobId) : ROUTES.SIGN_IN}
      className={`${buttonClasses} primary-gradient text-white hover:opacity-90`}
    >
      Apply now
      <ExternalLink className="size-4" aria-hidden="true" />
    </Link>
  )
}

export default ApplyJob
