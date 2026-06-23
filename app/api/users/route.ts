import { User } from "@/database/models"
import { HandleError } from "@/lib/handlers"
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";


export async function GET() {
  try {
    await dbConnect();
    const users = await User.find();
    return NextResponse.json(users)
  } catch (error: any) {
    return HandleError(error) as unknown as ApiErrorResponse
  }
}
export async function POST(request:NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const user = await User.create(body);
    return NextResponse.json(user)
  } catch (error: any) {
    return HandleError(error) as unknown as ApiErrorResponse
  }
}

