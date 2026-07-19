import mongoose from "mongoose";
import { NextResponse } from "next/server";
import slugify from "slugify";

import { Account } from "@/database/models";
import { User } from "@/database/models";
import { dbConnect, signInOauthSchema } from "@/lib";
import { HandleError } from "@/lib/handlers";

export async function POST(request: Request) {
  const session = await mongoose.startSession();

  try {
    await dbConnect();
    const requestBody = await request.json();

    const sluggedUsername = slugify(requestBody?.user?.username ?? "", {
      lower: true,
      strict: true,
      trim: true,
    });

    const oauthPayload = {
      provider: requestBody?.provider,
      providerAccountId: requestBody?.providerAccountId,
      image: requestBody?.user?.image ?? requestBody?.image,
      user: {
        ...requestBody?.user,
        username: sluggedUsername,
      },
    };

    const validationResult = signInOauthSchema.safeParse(oauthPayload);
    if (!validationResult.success) {
      throw validationResult.error;
    }

    const validatedPayload = validationResult.data;

    session.startTransaction();

    const existingAccount = await Account.findOne({
      provider: validatedPayload.provider,
      providerAccountId: validatedPayload.providerAccountId,
    })
      .populate("user")
      .session(session);

    if (existingAccount) {
      await session.commitTransaction();
      return NextResponse.json(
        { message: "User already exists", user: existingAccount.user ?? null },
        { status: 200 },
      );
    }

    const newUser = new User({
      ...validatedPayload.user,
      joinedAt: new Date(),
    });
    await newUser.save({ session });

    const newAccount = new Account({
      name: newUser.name,
      image: newUser.image,
      provider: validatedPayload.provider,
      providerAccountId: validatedPayload.providerAccountId,
      user: newUser._id,
    });
    await newAccount.save({ session });

    await session.commitTransaction();

    return NextResponse.json({ message: "User created successfully", user: newUser }, { status: 201 });
  } catch (error: unknown) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    const errorMessage = error instanceof Error ? error.message : "Something went wrong";
    return HandleError(errorMessage) as unknown as ApiErrorResponse;
  } finally {
    session.endSession();
  }
}