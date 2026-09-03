import { Schema, Types } from "mongoose"

export interface IQuestionView {
  question: Types.ObjectId
  visitorId: string
}

export const QuestionViewSchema = new Schema<IQuestionView>(
  {
    question: {
      type: Schema.Types.ObjectId,
      ref: "Question",
      required: true
    },
    visitorId: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
)

QuestionViewSchema.index({ question: 1, visitorId: 1 }, { unique: true })
