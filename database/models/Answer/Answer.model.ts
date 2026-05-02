import {model,models} from "mongoose"

import {AnswerSchema,IAnswer} from "@/database"


export const Answer=models?.Answer ||model<IAnswer>("Answer",AnswerSchema);
