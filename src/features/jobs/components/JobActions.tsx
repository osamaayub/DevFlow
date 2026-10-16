import ApplyJob from "./ApplyJob"
import SaveJob from "./SaveJob"
import ShareJob from "./ShareJob"

const JobActions = ({ jobId }: { jobId: string }) => (
  <div className="flex flex-col gap-2">
    <ApplyJob jobId={jobId} />
    <SaveJob jobId={jobId} />
    <ShareJob />
  </div>
)

export default JobActions
