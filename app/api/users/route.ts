import { User } from "@/database/models"
import { HandleError } from "@/lib/handlers"
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import { ValidationError } from "@/lib";


export async function GET() {
  try {
    await dbConnect();
    const users = await User.find();
    return NextResponse.json({success:true,data:users,statusCode:200})
  } catch (error: any) {
    return HandleError(error) as unknown as ApiErrorResponse
  }
}
export async function POST(request:NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const exisitingUser=await User.findOne({email: body.email});
    if(!exisitingUser){
      throw new Error("User Already Exists")
    }
    const user = await User.create(body);

    return NextResponse.json({success:true,data:user,statusCode:201}, {status:201})
  } catch (error: any) {
    return HandleError(error) as unknown as ApiErrorResponse
  }
}

