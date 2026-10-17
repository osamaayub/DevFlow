import { Schema, Types } from "mongoose"

export interface IJob {
  _id: string
  title: string
  company: string
  companyLogo?: string
  category: string
  description: string
  employmentType: string
  salaryRange: string
  location: string
  postedDate: Date
  postedBy?: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

export const JobSchema = new Schema<IJob>(
  {
    title: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    companyLogo: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    employmentType: {
      type: String,
      required: true,
    },
    salaryRange: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    postedDate: {
      type: Date,
      default: Date.now,
    },
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
)

JobSchema.index({
  title: "text",
  company: "text",
  category: "text",
  location: "text",
})
JobSchema.index({ createdAt: -1 })
JobSchema.index({ postedBy: 1, createdAt: -1 })
JobSchema.index({ postedDate: -1 })
JobSchema.index({ category: 1, postedDate: -1 })
