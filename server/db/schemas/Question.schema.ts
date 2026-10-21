import { Schema, Types } from "mongoose"

export interface IQuestion {
    _id: string
  title: string
  content: string
  tags: Types.ObjectId[]
  views: number
  upvotes: number
  downvotes: number
  answers: number
  author: Types.ObjectId,
  createdAt:Date
}

export const QuestionSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
    views: {
      type: Number,
      default: 0
    },
    upvotes: {
      type: Number,
      default: 0
    },
    downvotes: {
      type: Number,
      default: 0
    },
    answers: {
      type: Number,
      default: 0
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required:true
    }
  },
  { timestamps: true }
)

QuestionSchema.index({
  author: 1,
  upvotes: -1,
  views: -1,
  createdAt: -1,
})
QuestionSchema.index({ author: 1, tags: 1 })

// Home feed / sidebar sorts and filters
QuestionSchema.index({ createdAt: -1 })
QuestionSchema.index({ upvotes: -1, createdAt: -1 })
QuestionSchema.index({ views: -1, createdAt: -1 })
QuestionSchema.index({ answers: 1, createdAt: -1 })
// Search queries use MongoDB's text index instead of scanning title/content with a regex.
QuestionSchema.index({ title: "text", content: "text" })
