
import { NextResponse, NextRequest } from "next/server";

import { Account } from "@/database/models";
import { dbConnect, ValidationError } from "@/lib";
import { HandleError } from "@/lib/handlers";

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const body = await request.json();
        const { providerAccountId } = body;
        if (!providerAccountId || typeof providerAccountId !== "string") {
           throw new ValidationError({ providerAccountId: ["Provider Account ID is required."] });
        }
        const account = await Account.findOne({ providerAccountId });
        if (!account) {
            return NextResponse.json({
                message: "Account not found",
                success: false,
            }, { status: 404 });
        }
        return NextResponse.json({
            message: "Account found",
            success: true,
            data: account
        }, { status: 200 });
    }
    catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Something went wrong";
        return HandleError(errorMessage) as unknown as ApiErrorResponse;
    }
}