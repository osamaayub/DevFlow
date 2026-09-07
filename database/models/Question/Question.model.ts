import { model, models } from "mongoose"

import { IQuestion } from "../../schemas/Question.schema"
import { QuestionSchema } from "../../schemas/Question.schema"

export const Question = models?.Question || model<IQuestion>("Question", QuestionSchema)
