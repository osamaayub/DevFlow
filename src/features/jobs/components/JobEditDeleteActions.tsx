"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { deleteJob } from "@/features/jobs/actions"
import ROUTES from "@/shared/constants/route"

interface JobEditDeleteActionsProps {
  jobId: string
  title: string
  // Where to send the user after deleting; omit to stay on the current (revalidated) page
  redirectTo?: string
}

const JobEditDeleteActions = ({ jobId, title, redirectTo }: JobEditDeleteActionsProps) => {
  const router = useRouter()
  const [isConfirming, setIsConfirming] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteJob({ jobId })

      if (!result.success) {
        toast.error(result.error?.message || "Could not delete this job.")
        setIsConfirming(false)
        return
      }

      toast.success("Job deleted.")
      if (redirectTo) router.replace(redirectTo)
    })
  }

  if (isConfirming) {
    return (
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <span className="small-regular text-dark400_light700">Delete this job?</span>
        <button
          type="button"
          disabled={isPending}
          onClick={handleDelete}
          className="small-semibold rounded-md bg-red-500 px-3 py-1 text-white hover:opacity-90 disabled:opacity-60"
        >
          {isPending ? "Deleting…" : "Delete"}
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => setIsConfirming(false)}
          className="small-semibold text-dark400_light700 hover:underline"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <div className="flex shrink-0 items-center gap-2">
      <Link
        href={ROUTES.JOBS_EDIT(jobId)}
        aria-label={`Edit ${title}`}
        title="Edit job"
        className="rounded p-1.5 transition hover:bg-sky-500/10"
      >
        <Image src="/icons/edit.svg" alt="" width={16} height={16} />
      </Link>
      <button
        type="button"
        aria-label={`Delete ${title}`}
        title="Delete job"
        onClick={() => setIsConfirming(true)}
        className="rounded p-1.5 transition hover:bg-red-500/10"
      >
        <Image src="/icons/trash.svg" alt="" width={16} height={16} />
      </button>
    </div>
  )
}

export default JobEditDeleteActions
