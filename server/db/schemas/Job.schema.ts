import { Schema, Types } from "mongoose"

export interface IJob {
  _id: string
  title: string
  company: string
  companyLogo?: string
  applicationUrl?: string
  category: string
  description: string
  employmentType: string
  salaryRange: string
  location: string
  postedDate: Date
  postedBy?: Types.ObjectId
  salaryMin?: number
  salaryMax?: number
  createdAt: Date
  updatedAt: Date
}

const parseSalaryAmount = (value = "") => {
  const normalized = value.trim().toLowerCase()
  const amount = Number(normalized.match(/[\d,.]+/)?.[0]?.replaceAll(",", "") || 0)

  if (normalized.includes("m")) return amount * 1_000_000
  if (normalized.includes("k")) return amount * 1_000
  return amount
}

// "80k - 100k" → { salaryMin: 80000, salaryMax: 100000 }
export const parseSalaryRange = (salaryRange: string) => {
  const [low, high] = salaryRange.split("-")
  const salaryMin = parseSalaryAmount(low)
  const salaryMax = high ? parseSalaryAmount(high) : salaryMin
  return { salaryMin, salaryMax: Math.max(salaryMin, salaryMax) }
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
    applicationUrl: {
      type: String,
      required: true,
      trim: true,
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
    salaryMin: {
      type: Number,
    },
    salaryMax: {
      type: Number,
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
// Keep numeric salary bounds in sync so salary sorting can run inside MongoDB
JobSchema.pre("save", function () {
  if (this.isModified("salaryRange") || this.salaryMin == null) {
    Object.assign(this, parseSalaryRange(this.salaryRange))
  }
})

JobSchema.index({ createdAt: -1 })
JobSchema.index({ postedBy: 1, createdAt: -1 })
JobSchema.index({ postedDate: -1 })
JobSchema.index({ category: 1, postedDate: -1 })
JobSchema.index({ location: 1, postedDate: -1 })
JobSchema.index({ salaryMax: -1, _id: -1 })
JobSchema.index({ salaryMin: 1, _id: 1 })
