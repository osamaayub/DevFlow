import { User } from "@/database/models"
import { HandleError } from "@/lib/handlers"
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import { isValidObjectId } from "mongoose";

export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await context.params;
        const query = isValidObjectId(id) ? { _id: id } : { username: id };
        const user = await User.findOne(query).select("name username email bio image location portfolio reputation joinedAt");

        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found", statusCode: 404 },
                { status: 404 },
            );
        }

        return NextResponse.json({ success: true, data: user, statusCode: 200 });
    } catch (error: any) {
        return HandleError(error) as unknown as ApiErrorResponse;
    }
}
