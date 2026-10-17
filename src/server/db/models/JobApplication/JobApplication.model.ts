import { model, models } from "mongoose"

import {
  JobApplicationSchema,
  type IJobApplication,
} from "../../schemas/JobApplication.schema"

export const JobApplication =
  models?.JobApplication ||
  model<IJobApplication>("JobApplication", JobApplicationSchema)
