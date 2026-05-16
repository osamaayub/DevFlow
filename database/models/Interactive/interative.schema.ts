import {Schema,Types} from "mongoose"


export interface IInteraction{
    user:Types.ObjectId,
    action:string,
    question:Types.ObjectId,
    tags:Types.ObjectId,
    answer:Types.ObjectId,

}


export const InteractionSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  action: { type: String, required: true },
  question: { type: Schema.Types.ObjectId, ref: "Question" },
  answer: { type: Schema.Types.ObjectId, ref: "Answer" },
  tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
},{timestamps:true});