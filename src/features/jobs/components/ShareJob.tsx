"use client"

import { Share2 } from "lucide-react"
import { toast } from "sonner"

const ShareJob = () => {
  const handleShareJob = async () => {
    const url = window.location.href

    try {
      if (navigator.share) {
        await navigator.share({ title: document.title, url })
      } else {
        await navigator.clipboard.writeText(url)
        toast.success("Job link copied.")
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        toast.error("Could not share this job.")
      }
    }
  }

  return (
    <button
      type="button"
      onClick={handleShareJob}
      className="text-dark400_light700 inline-flex min-h-9 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium hover:bg-light-800 dark:hover:bg-dark-300"
    >
      <Share2 className="size-4" aria-hidden="true" /> Share job
    </button>
  )
}

export default ShareJob
