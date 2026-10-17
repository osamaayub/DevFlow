import ApplyJob from "./ApplyJob"
import SaveJob from "./SaveJob"
import ShareJob from "./ShareJob"

interface JobActionsProps {
  jobId: string
  hasApplied: boolean
  hasSaved: boolean
  isAuthenticated: boolean
}

const JobActions = ({ jobId, hasApplied, hasSaved, isAuthenticated }: JobActionsProps) => (
  <div className="flex flex-col gap-2">
    <ApplyJob jobId={jobId} hasApplied={hasApplied} isAuthenticated={isAuthenticated} />
    <SaveJob jobId={jobId} initialSaved={hasSaved} isAuthenticated={isAuthenticated} />
    <ShareJob />
  </div>
)

export default JobActions
