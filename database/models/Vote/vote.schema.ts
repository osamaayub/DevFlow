import { Schema, Types } from "mongoose";

export interface IVote {
    author: Types.ObjectId;
    id: Types.ObjectId;
    type: "Question" | "Answer";
    value: 1 | -1;
}

export const VoteSchema = new Schema<IVote>(
    {
        author: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        id: {
            type: Schema.Types.ObjectId,
            refPath: "type",
            required: true,
        },
        type: {
            type: String,
            enum: ["Question", "Answer"],
            required: true,
        },
        value: {
            type: Number,
            enum: [1, -1],
            required: true,
        },
    },
    { timestamps: true }
);