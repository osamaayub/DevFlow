import { NextResponse } from "next/server";

import { dbConnect } from "@/lib/mongoose";
import { User } from "@/database/models/User";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  await dbConnect();

  const userId = params.id;
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Missing required user id." },
      { status: 400 },
    );
  }

  try {
    const user = await User.findById(userId).select(
      "name username email bio image location portfolio reputation joinedAt",
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User profile not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, user }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to fetch user profile.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
