import { Schema, Types } from 'mongoose'



export interface IAnswer {
    author: Types.ObjectId,
    content: string,
    question: Types.ObjectId,
    upvotes: number,
    downvotes: number,
}
export const AnswerSchema = new Schema({
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    question: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
})