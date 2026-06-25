import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { User } from "@/database/models";
import { dbConnect } from "@/lib";
import { HandleError } from "@/lib/handlers/errorHandler";
import { ValidationError } from "@/lib/http-error";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const bodySchema = z.object({
      email: z.string().trim().email({ message: "Please provide a valid email address." }),
    });
    const parsedBody = bodySchema.safeParse(body);

    if (!parsedBody.success) {
      throw new ValidationError(parsedBody.error.flatten().fieldErrors);
    }

    const { email } = parsedBody.data;
    const normalizedEmail = email.trim().toLowerCase();
    const escapedEmail = normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const users = await User.find({
      email: { $regex: `^${escapedEmail}$`, $options: "i" },
    });

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: users }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof ValidationError) {
      return HandleError(error);
    }

    const errorMessage = error instanceof Error ? error.message : "Something went wrong";
    return HandleError(errorMessage) as unknown as ApiErrorResponse;
  }
}
