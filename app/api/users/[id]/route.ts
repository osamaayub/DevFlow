import { User } from "@/database/models";
import { HandleError } from "@/lib/handlers";
import { NotFoundError } from "@/lib/http-error";
import { dbConnect } from "@/lib/mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const user = await User.findById(id);
    if (!user) throw new NotFoundError({ user: ["User not found"] });
    return NextResponse.json({ success: true, data: user, statusCode: 200 });
  } catch (error: any) {
    return HandleError(error) as unknown as ApiErrorResponse;
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const user = await User.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!user) throw new NotFoundError({ user: ["User not found"] });
    return NextResponse.json({ success: true, data: user, statusCode: 200 });
  } catch (error: any) {
    return HandleError(error) as unknown as ApiErrorResponse;
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const user = await User.findByIdAndDelete(id);
    if (!user) throw new NotFoundError({ user: ["User not found"] });
    return NextResponse.json({ success: true, data: user, statusCode: 200 });
  } catch (error: any) {
    return HandleError(error) as unknown as ApiErrorResponse;
  }
}
