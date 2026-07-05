import { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

import { Account } from "@/database/models";
import { dbConnect } from "@/lib";
import { HandleError } from "@/lib/handlers";

export const GET = async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    await dbConnect();
    const { id } = await params;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid account id" },
        { status: 400 },
      );
    }

    const account = await Account.findById(id);
    if (!account) {
      throw new Error("Account not found");
    }

    return NextResponse.json({ success: true, data: account }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Something went wrong";
    return HandleError(errorMessage) as unknown as ApiErrorResponse;
  }
};

export const DELETE = async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    await dbConnect();
    const { id } = await params;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid account id" },
        { status: 400 },
      );
    }

    const account = await Account.findByIdAndDelete(id);
    if (!account) {
      throw new Error("Account not found");
    }

    return NextResponse.json(
      { success: true, message: "Account deleted successfully" },
      { status: 200 },
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Something went wrong";
    return HandleError(errorMessage) as unknown as ApiErrorResponse;
  }
};

export const PUT = async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    await dbConnect();
    const { id } = await params;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid account id" },
        { status: 400 },
      );
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Something went wrong";
    return HandleError(errorMessage) as unknown as ApiErrorResponse;
  }
};