import {Schema, Types}from "mongoose"

export interface IVote{
    author:Types.ObjectId,
    id:Types.ObjectId,
    voteType:"Question"|"Answer"
}

export const VoteSchema = new Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    voteType: {
        type: String,
        enum:["Question","Answer"],
        required: true
    },
}, { timestamps: true });