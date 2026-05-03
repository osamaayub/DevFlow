import {Schema, Types}from "mongoose"

export interface IVote{
    author:Types.ObjectId,
    id:Types.ObjectId,
    referenceModel:"Question"|"Answer",
    voteType:"upvote"|"downvote"
}

export const VoteSchema = new Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    id: {
        type: Schema.Types.ObjectId,
        refPath: 'referenceModel',
        required: true
    },
    referenceModel: {
        type: String,
        enum: ["Question", "Answer"],
        required: true
    },
    voteType: {
        type: String,
        enum: ["upvote", "downvote"],
        required: true
    }
}, { timestamps: true });