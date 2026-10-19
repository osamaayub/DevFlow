import { model, models } from "mongoose"

import { SavedJobSchema, type ISavedJob } from "../../schemas/SavedJob.schema"

export const SavedJob =
  models?.SavedJob || model<ISavedJob>("SavedJob", SavedJobSchema)
