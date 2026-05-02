
import  { Schema} from "mongoose";


export interface ITag{
  name:string,
  Questions:number;
}

export const TagSchema=new Schema({
  name:{type:String,required:true,unique:true},
  Questions:{type:Number,default:0}

},{timestamps:true})              