import { model, models } from "mongoose"

import type { IJob } from "../../schemas/Job.schema"
import { JobSchema } from "../../schemas/Job.schema"

export const Job = models?.Job || model<IJob>("Job", JobSchema)
