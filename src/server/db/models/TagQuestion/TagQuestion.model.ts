import { model, models } from "mongoose"

import { TagQuestionSchema, ITagQuestion } from "../../schemas/TagQuestion.schema"

export const TagQuestion = models?.TagQuestion || model<ITagQuestion>("TagQuestion", TagQuestionSchema)