"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"

import { updateApplicationStatus } from "@/features/jobs/actions"
import type { JobApplicationStatus } from "@/features/jobs/types"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"

const STATUS_OPTIONS: Array<{ value: JobApplicationStatus; label: string }> = [
  { value: "submitted", label: "Submitted" },
  { value: "reviewing", label: "In review" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Not selected" },
]

interface ApplicantStatusSelectProps {
  applicationId: string
  status: JobApplicationStatus
}

const ApplicantStatusSelect = ({ applicationId, status }: ApplicantStatusSelectProps) => {
  const [value, setValue] = useState(status)
  const [isPending, startTransition] = useTransition()

  const handleChange = (nextStatus: string) => {
    const previous = value
    setValue(nextStatus as JobApplicationStatus)

    startTransition(async () => {
      const result = await updateApplicationStatus({
        applicationId,
        status: nextStatus as JobApplicationStatus,
      })

      if (result.success) {
        toast.success("Application status updated.")
      } else {
        setValue(previous)
        toast.error(result.error?.message || "Could not update the status.")
      }
    })
  }

  return (
    <Select value={value} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger
        aria-label="Application status"
        className="background-light800_dark300 light-border text-dark400_light700 body-medium min-h-10 w-full rounded-lg border shadow-none focus:ring-0 focus:ring-offset-0 sm:w-44"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="background-light900_dark200 text-dark500_light700">
        {STATUS_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default ApplicantStatusSelect
