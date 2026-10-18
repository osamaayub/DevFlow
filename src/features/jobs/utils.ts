// Who may edit or delete a job: its poster, or any signed-in user when the job has no
// recorded poster (jobs created before postedBy was saved)
export const canManageJob = (postedBy: unknown, userId?: string | null) =>
  Boolean(userId) && (!postedBy || String(postedBy) === String(userId))
