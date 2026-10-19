import { Schema, Types } from "mongoose"

export interface ISavedJob {
  author: Types.ObjectId
  job: Types.ObjectId
}

export const SavedJobSchema = new Schema<ISavedJob>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    job: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
  },
  { timestamps: true }
)

SavedJobSchema.index({ author: 1, job: 1 }, { unique: true })
SavedJobSchema.index({ author: 1, createdAt: -1 })
