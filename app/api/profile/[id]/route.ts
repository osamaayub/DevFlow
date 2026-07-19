import { NextResponse } from "next/server";

import { User } from "@/database/models/User";
import { dbConnect } from "@/lib/mongoose";

type ProfileParams = { id: string };

type ProfileRouteContext =
  | { params: ProfileParams }
  | { params: Promise<ProfileParams> };

export async function GET(
  request: Request,
  context: ProfileRouteContext,
) {
  await dbConnect();

  const params = await context.params;
  const userId = params?.id;
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
