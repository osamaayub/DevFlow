import { NextRequest, NextResponse } from "next/server";

import { User } from "@/database/models";
import { dbConnect } from "@/lib";
import { HandleError } from "@/lib/handlers/errorHandler";

export async  function  GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email query parameter is required" },
        { status: 400 },
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const escapedEmail = normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const user = await User.find({
      email: { $regex: `^${escapedEmail}$`, $options: "i" },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: user }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Something went wrong";
    return HandleError(errorMessage) as unknown as ApiErrorResponse;
  }
}
