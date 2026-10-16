"use client"

import { ExternalLink } from "lucide-react"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { applyToJob, hasAppliedToJob } from "@/features/jobs/actions"

const ApplyJob = ({ jobId }: { jobId: string }) => {
  const session = useSession()
  const userId = session.data?.user?.id
  const [isApplying, setIsApplying] = useState(false)
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

  const handleApply = async () => {
    if (isApplying || isCheckingApplication || hasApplied) return
    if (!userId) return toast("You must be logged in to apply for a job.")

    setIsApplying(true)
    try {
      const result = await applyToJob({ jobId })
      if (result.success && result.data) {
        setHasApplied(true)
        toast.success(
          result.data.alreadyApplied
            ? "You have already applied for this job."
            : "Your application has been recorded in DevFlow."
        )
      } else {
        toast.error(result.error?.message || "Could not submit your application.")
      }
    } catch {
      toast.error("An error occurred while submitting your application.")
    } finally {
      setIsApplying(false)
    }
  }

  if (isCheckingApplication) {
    return (
      <div
        role="status"
        aria-label="Checking application status"
        className="min-h-11 animate-pulse rounded-lg bg-light-800 dark:bg-dark-300"
      />
    )
  }

  return (
    <button
      type="button"
      disabled={isApplying || hasApplied}
      onClick={handleApply}
      className="primary-gradient inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isApplying ? "Submitting…" : hasApplied ? "Applied" : "Apply now"}
      {!hasApplied && <ExternalLink className="size-4" aria-hidden="true" />}
    </button>
  )
}

export default ApplyJob
