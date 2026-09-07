import { model, models } from "mongoose"

import { IAnswer } from "../../schemas/Answer.schema"
import { AnswerSchema } from "../../schemas/Answer.schema"

export const Answer = models?.Answer || model<IAnswer>("Answer", AnswerSchema)
