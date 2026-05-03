
import  { Schema} from "mongoose";


export interface ITag{
  name:string,
  questions:number;
}

export const TagSchema=new Schema({
  name:{type:String,required:true,unique:true},
  questions:{type:Number,default:0}

},{timestamps:true})              