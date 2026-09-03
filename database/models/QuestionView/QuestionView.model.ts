import { model, models } from "mongoose"

import { IQuestionView, QuestionViewSchema } from "./QuestionView.schema"

export const QuestionView =
  models?.QuestionView || model<IQuestionView>("QuestionView", QuestionViewSchema)
