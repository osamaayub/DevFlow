import {model,models} from "mongoose"

import {QuestionsSchema,IQuestion} from "@/database"


export const Question=models?.Question ||model<IQuestion>("Question",QuestionsSchema);
