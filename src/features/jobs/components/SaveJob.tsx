"use client"

import { Bookmark, Check } from "lucide-react"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { hasSavedJob, toggleSaveJob } from "@/features/jobs/actions"

const SaveJob = ({ jobId }: { jobId: string }) => {
  const session = useSession()
  const userId = session.data?.user?.id
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isCheckingSaved, setIsCheckingSaved] = useState(true)

  useEffect(() => {
    if (session.status === "loading") return
    if (!userId) {
      setIsSaved(false)
      setIsCheckingSaved(false)
      return
    }

    let isActive = true
    setIsCheckingSaved(true)

    const loadSavedState = async () => {
      try {
        const result = await hasSavedJob({ jobId })
        if (isActive) setIsSaved(result.success && Boolean(result.data?.saved))
      } catch {
        if (isActive) setIsSaved(false)
      } finally {
        if (isActive) setIsCheckingSaved(false)
      }
    }

    void loadSavedState()
    return () => {
      isActive = false
    }
  }, [jobId, session.status, userId])

  const handleSaveJob = async () => {
    if (isSaving || isCheckingSaved) return
    if (!userId) return toast("You must be logged in to save a job.")

    setIsSaving(true)
    try {
      const result = await toggleSaveJob({ jobId })
      if (result.success && result.data) {
        setIsSaved(result.data.saved)
        toast.success(
          result.data.saved
            ? "Job saved successfully."
            : "Job removed from saved jobs."
        )
      } else {
        toast.error(result.error?.message || "Could not update saved jobs.")
      }
    } catch {
      toast.error("An error occurred while saving this job.")
    } finally {
      setIsSaving(false)
    }
  }

  if (isCheckingSaved) {
    return (
      <div
        role="status"
        aria-label="Checking saved job"
        className="min-h-10 animate-pulse rounded-lg bg-light-800 dark:bg-dark-300"
      />
    )
  }

  return (
    <button
      type="button"
      aria-label={isSaved ? "Remove saved job" : "Save job"}
      aria-pressed={isSaved}
      disabled={isSaving}
      onClick={handleSaveJob}
      className="light-border text-dark400_light700 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors hover:bg-light-800 disabled:opacity-50 dark:hover:bg-dark-300"
    >
      {isSaved ? <Check className="size-4 text-primary-500" aria-hidden="true" /> : <Bookmark className="size-4" aria-hidden="true" />}
      {isSaved ? "Saved" : "Save job"}
    </button>
  )
}

export default SaveJob
