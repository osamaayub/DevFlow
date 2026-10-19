import { connection, NextRequest, NextResponse } from "next/server"

import { User } from "@/server/db"
import { dbConnect } from "@/server/db/connect"
import { HandleError } from "@/server/errors/error-handler"
import { APIErrorResponse } from "@/shared/types";

export async function GET() {
  try {
    // Database data: render at request time, never at build time
    await connection();
    await dbConnect();
    const users = await User.find();
    return NextResponse.json({ success: true, data: users, statusCode: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Something went wrong";
    return HandleError(errorMessage) as unknown as APIErrorResponse;
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const existingUser = await User.findOne({ email: body.email });

    if (existingUser) {
      throw new Error("User already exists");
    }

    const user = await User.create(body);

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Something went wrong";
    return HandleError(errorMessage) as unknown as APIErrorResponse;
  }
}

