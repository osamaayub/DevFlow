import { model, models } from "mongoose"

import { IAnswer } from "./Answer.schema"
import { AnswerSchema } from "./Answer.schema"

export const Answer = models?.Answer || model<IAnswer>("Answer", AnswerSchema)
