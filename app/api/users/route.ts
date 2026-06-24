import { NextRequest, NextResponse } from "next/server";

import { User } from "@/database/models";
import { HandleError } from "@/lib/handlers";
import { dbConnect } from "@/lib/mongoose";

export async function GET() {
  try {
    await dbConnect();
    const users = await User.find();
    return NextResponse.json({ success: true, data: users, statusCode: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Something went wrong";
    return HandleError(errorMessage) as unknown as ApiErrorResponse;
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const existingUser = await User.findOne({ email: body.email });

    if (!existingUser) {
      throw new Error("User Already Exists");
    }

    const user = await User.create(body);

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Something went wrong";
    return HandleError(errorMessage) as unknown as ApiErrorResponse;
  }
}

