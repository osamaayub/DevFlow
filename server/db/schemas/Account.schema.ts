import { Types } from "mongoose";
import { Schema } from "mongoose";



export interface IAccount{
    name:string;
    password?:string;
    userId:Types.ObjectId,
    image?:string,
    provider:string,
    providerAccountId:string
}



export const AccountSchema= new Schema({

    name:{
        type:String,
        required:true
    },
    password:{
        type:String
    },
    image:{
        type:String
    },
    userId:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    provider:{
        type:String,
        required:true
    },
    providerAccountId:{
        type:String,
        required:true
    }

},{timestamps:true});

// Every sign-in looks an account up by (provider, providerAccountId)
AccountSchema.index({ provider: 1, providerAccountId: 1 }, { unique: true });
AccountSchema.index({ userId: 1 });