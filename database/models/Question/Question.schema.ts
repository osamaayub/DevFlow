import { Schema, Types } from "mongoose"

export interface IQuestion {
  title: string
  content: string
  tags: Types.ObjectId[]
  views: Number
  upvotes: Number
  downvotes: Number
  answers: Number
  author: Types.ObjectId
}

export const QuestionsSchema = new Schema(
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
