import { Schema, Types } from 'mongoose';


export interface ICollection {
 author:Types.ObjectId,
 question:Types.ObjectId,
}

export const CollectionSchema = new Schema({  
    author:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    question:{
        type:Schema.Types.ObjectId,
        ref:"Question",
        required:true
    }
}, { timestamps: true })

// Saved-question lookups for a user, and cleanup by question
CollectionSchema.index({ author: 1, question: 1 })
CollectionSchema.index({ question: 1 })
