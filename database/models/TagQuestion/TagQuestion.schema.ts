import { Schema, Types } from "mongoose";


export interface ITagQuestion {
    question: Types.ObjectId,
    tagId: Types.ObjectId
}

export const TagQuestionSchema = new Schema({
    question: { type: Schema.Types.ObjectId, ref: "Question", required: true },
    tagId: { type: Schema.Types.ObjectId, ref: "Tag", required: true }
}, {
    timestamps: true
})