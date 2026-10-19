import { deleteModel, model, models } from "mongoose"

import type { IJob } from "../../schemas/Job.schema"
import { JobSchema } from "../../schemas/Job.schema"

// In development, hot reloads keep the previously compiled model alive. Reusing it after
// the schema changes silently drops new fields (e.g. postedBy), so rebuild it instead.
if (process.env.NODE_ENV !== "production" && models?.Job) {
  deleteModel("Job")
}

export const Job = models?.Job || model<IJob>("Job", JobSchema)
