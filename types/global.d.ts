import type { NextResponse } from "next/server";

declare module "*.css";
declare module "*.scss";
declare module "*.sass";

declare global {
  interface Tag{
    _id:string,
    name:string
  }
 interface Author{
  _id:string,
  name:string,
  image:string
 }
 
 interface Question{
      _id:string,
      title:string,
      author:Author,
      tags:Tag[]
      createdAt:Date,
      upvotes:number,
      answers:number,
      views:number,
}

interface ActionResponse<t=null>{
  success:boolean,
  data:t,
  error?:{
   message:string,
   details?:Record<string, string[]>
  }
  statusCode:number
}
interface SuccessResponse<t=null> extends ActionResponse<t>{
  success:true,
  error?:undefined
}
interface ErrorResponse<t=null> extends ActionResponse<t>{
  success:false,
  data?:undefined
}
interface ApiSuccessResponse<t=null> extends SuccessResponse<t>, ErrorResponse<t>{
    success:boolean,
    data?:t,
    error?:{
      message:string,
      details?:Record<string, string[]>
    }
    statusCode:number
}  
type ApiErrorResponse<t = null> = NextResponse<{
    success: false,
    data?: undefined,
    message: string,
    error: {
      message:string,
      details?:Record<string, string[]>
    },
    statusCode:number
}>;
}
