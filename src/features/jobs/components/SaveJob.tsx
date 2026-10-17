"use client"

import { Bookmark, Check } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { toggleSaveJob } from "@/features/jobs/actions"

interface SaveJobProps {
  jobId: string
  initialSaved: boolean
  isAuthenticated: boolean
}

const SaveJob = ({ jobId, initialSaved, isAuthenticated }: SaveJobProps) => {
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(initialSaved)

  const handleSaveJob = async () => {
    if (isSaving) return
    if (!isAuthenticated) return toast("You must be logged in to save a job.")

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
