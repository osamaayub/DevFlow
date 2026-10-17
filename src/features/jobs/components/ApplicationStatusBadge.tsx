import type { JobApplicationStatus } from "@/features/jobs/types"
import { cn } from "@/shared/lib/utils"

const STATUS_STYLES: Record<JobApplicationStatus, { label: string; className: string }> = {
  submitted: { label: "Submitted", className: "bg-blue-500/10 text-blue-500" },
  reviewing: { label: "In review", className: "bg-amber-500/10 text-amber-500" },
  accepted: { label: "Accepted", className: "bg-green-500/10 text-green-500" },
  rejected: { label: "Not selected", className: "bg-red-500/10 text-red-500" },
}

const ApplicationStatusBadge = ({ status }: { status: JobApplicationStatus }) => {
  const { label, className } = STATUS_STYLES[status] ?? STATUS_STYLES.submitted

  return (
    <span className={cn("small-semibold inline-flex items-center rounded-full px-3 py-1", className)}>
      {label}
    </span>
  )
}

export default ApplicationStatusBadge
