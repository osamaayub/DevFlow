import { Schema, Types } from "mongoose"

export interface IJobApplication {
  applicant: Types.ObjectId
  job: Types.ObjectId
  applicantName: string
  applicantEmail: string
  status: "submitted" | "reviewing" | "rejected" | "accepted"
  appliedAt: Date
}

export const JobApplicationSchema = new Schema<IJobApplication>(
  {
    applicant: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    job: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    applicantName: {
      type: String,
      required: true,
    },
    applicantEmail: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["submitted", "reviewing", "rejected", "accepted"],
      default: "submitted",
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
)

JobApplicationSchema.index({ applicant: 1, job: 1 }, { unique: true })
