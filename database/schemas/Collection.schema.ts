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