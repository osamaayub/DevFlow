import {Schema, Types}from "mongoose"

export interface IVote{
    author:Types.ObjectId,
    content:string,
    voteType:"upvote"|"downvote"
}

export const VoteSchema = new Schema({
    author: {
        type: Types.ObjectId,
        ref: "User",
        required: true
    },
    content: {
        type: String,
        required: true
    },
    voteType: {
        type: String,
        enum: ["upvote", "downvote"],
        required: true
    }
}, { timestamps: true });