import { Schema, Types } from "mongoose";

export enum Type {
    QUESTION = "question",
    ANSWER = "answer",
}

export enum VoteType {
    UPVOTE = "upvote",
    DOWNVOTE = "downvote",
}

export interface IVote {
    author: Types.ObjectId;
    id: Types.ObjectId;
    type: Type;
    value: VoteType;
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
            required: true,
        },
        type: {
            type: String,
            enum: Object.values(Type),
            required: true,
        },
        value: {
            type: String,
            enum: Object.values(VoteType),
            required: true,
        },
    },
    { timestamps: true }
);

// "Has this user voted on these targets?" lookups and cleanup by target
VoteSchema.index({ author: 1, id: 1, type: 1 })
VoteSchema.index({ id: 1, type: 1 })
