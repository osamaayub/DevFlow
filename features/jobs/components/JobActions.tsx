import SaveJob from "./SaveJob"
import ShareJob from "./ShareJob"

interface JobActionsProps {
  jobId: string
  hasSaved: boolean
  isAuthenticated: boolean
}

const JobActions = ({ jobId, hasSaved, isAuthenticated }: JobActionsProps) => (
  <div className="flex flex-col gap-2">
    <SaveJob jobId={jobId} initialSaved={hasSaved} isAuthenticated={isAuthenticated} />
    <ShareJob />
  </div>
)

export default JobActions
