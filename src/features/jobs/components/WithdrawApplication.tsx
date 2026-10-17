"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"

import { withdrawApplication } from "@/features/jobs/actions"

const WithdrawApplication = ({ jobId }: { jobId: string }) => {
  const [isConfirming, setIsConfirming] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleWithdraw = () => {
    startTransition(async () => {
      const result = await withdrawApplication({ jobId })

      if (result.success) {
        toast.success("Application withdrawn.")
      } else {
        toast.error(result.error?.message || "Could not withdraw your application.")
        setIsConfirming(false)
      }
    })
  }

  if (!isConfirming) {
    return (
      <button
        type="button"
        onClick={() => setIsConfirming(true)}
        className="small-semibold text-red-500 hover:underline"
      >
        Withdraw
      </button>
    )
  }

  return (
    <span className="inline-flex items-center gap-3">
      <span className="small-regular text-dark400_light700">Withdraw application?</span>
      <button
        type="button"
        disabled={isPending}
        onClick={handleWithdraw}
        className="small-semibold rounded-md bg-red-500 px-3 py-1 text-white hover:opacity-90 disabled:opacity-60"
      >
        {isPending ? "Withdrawing…" : "Yes, withdraw"}
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => setIsConfirming(false)}
        className="small-semibold text-dark400_light700 hover:underline"
      >
        Cancel
      </button>
    </span>
  )
}

export default WithdrawApplication
