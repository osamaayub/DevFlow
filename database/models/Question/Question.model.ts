import { model, models } from "mongoose"

import { IQuestion } from "./Question.schema"
import { QuestionsSchema } from "./Question.schema"

export const Question = models?.Question || model<IQuestion>("Question", QuestionsSchema)
