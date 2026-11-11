"use server"

import { Types } from "mongoose"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import { getAdminActorId, isAdminEmail } from "@/server/admin-access"
import { User } from "@/server/db"
import { dbConnect } from "@/server/db/connect"
import logger from "@/shared/lib/logger"

const userIdSchema = z.string().regex(/^[0-9a-f]{24}$/i)
const searchSchema = z.string().trim().max(100)
const updateUserSchema = z.object({
  userId: userIdSchema,
  name: z.string().trim().min(2).max(80),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(2)
    .max(30)
    .regex(/^[a-z0-9._-]+$/, "Username can only contain letters, numbers, dots, underscores, and hyphens."),
  bio: z.string().trim().max(500),
  location: z.string().trim().max(100),
  portfolio: z.union([z.literal(""), z.string().trim().url()])
})

export type ManagedUser = {
  _id: string
  name: string
  username: string
  email: string
  bio: string
  location: string
  portfolio: string
  isSuspended: boolean
  isAdmin: boolean
  createdAt: string
}

type AdminActionResult<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string }

export async function getManagedUsers(value: string): Promise<AdminActionResult<ManagedUser[]>> {
  const actorId = await getAdminActorId()
  if (!actorId) return { success: false, error: "You are not authorized to manage users." }

  const parsedQuery = searchSchema.safeParse(value)
  if (!parsedQuery.success) {
    return { success: false, error: "Search text must be 100 characters or fewer." }
  }

  try {
    await dbConnect()
    const query = parsedQuery.data
    const filter = query
      ? {
          $or: ["name", "username", "email"].map((field) => ({
            [field]: { $regex: escapeRegex(query), $options: "i" }
          }))
        }
      : {}
    const users = await User.find(filter)
      .select("name username email bio location portfolio isSuspended createdAt")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean()

    return {
      success: true,
      data: users.map((user) => ({
        _id: String(user._id),
        name: user.name,
        username: user.username,
        email: user.email,
        bio: user.bio ?? "",
        location: user.location ?? "",
        portfolio: user.portfolio ?? "",
        isSuspended: user.isSuspended === true,
        isAdmin: isAdminEmail(user.email),
        createdAt: new Date(user.createdAt ?? Date.now()).toISOString()
      }))
    }
  } catch (error) {
    logger.error({ err: error }, "Failed to load managed users")
    return { success: false, error: "Unable to load users right now." }
  }
}

export async function updateManagedUser(input: unknown): Promise<AdminActionResult> {
  const actorId = await getAdminActorId()
  if (!actorId) return { success: false, error: "You are not authorized to manage users." }

  const parsed = updateUserSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Please check the user details and try again."
    }
  }

  try {
    await dbConnect()
    const { userId, name, username, bio, location, portfolio } = parsed.data
    const existingUser = await User.findById(userId).select("email").lean()
    if (!existingUser) return { success: false, error: "User not found." }

    const duplicateUsername = await User.findOne({
      username: { $regex: `^${escapeRegex(username)}$`, $options: "i" },
      _id: { $ne: new Types.ObjectId(userId) }
    })
      .select("_id")
      .lean()
    if (duplicateUsername) return { success: false, error: "That username is already in use." }

    await User.updateOne(
      { _id: userId },
      { $set: { name, username, bio, location, portfolio } },
      { runValidators: true }
    )

    revalidatePath("/admin/users")
    revalidatePath(`/profile/${userId}`)
    revalidatePath("/community")
    return { success: true }
  } catch (error) {
    logger.error({ err: error }, "Failed to update a managed user")
    return { success: false, error: "Unable to update this user right now." }
  }
}

export async function setUserSuspension(
  userId: string,
  isSuspended: boolean
): Promise<AdminActionResult> {
  const actorId = await getAdminActorId()
  if (!actorId) return { success: false, error: "You are not authorized to manage users." }

  const parsedId = userIdSchema.safeParse(userId)
  if (!parsedId.success || typeof isSuspended !== "boolean") {
    return { success: false, error: "Invalid user or suspension status." }
  }
  if (actorId === parsedId.data) {
    return { success: false, error: "You cannot suspend your own account." }
  }

  try {
    await dbConnect()
    const targetUser = await User.findById(parsedId.data)
      .select("email")
      .lean<{ email: string } | null>()
    if (!targetUser) return { success: false, error: "User not found." }
    if (isAdminEmail(targetUser.email)) {
      return { success: false, error: "Administrator accounts cannot be suspended here." }
    }

    await User.updateOne(
      { _id: parsedId.data },
      {
        $set: {
          isSuspended,
          suspendedAt: isSuspended ? new Date() : null
        }
      }
    )

    revalidatePath("/admin/users")
    revalidatePath(`/profile/${parsedId.data}`)
    revalidatePath("/community")
    logger.info(
      { actorId, targetUserId: parsedId.data, isSuspended },
      "Admin changed user suspension status"
    )
    return { success: true }
  } catch (error) {
    logger.error({ err: error }, "Failed to change user suspension status")
    return { success: false, error: "Unable to update this account right now." }
  }
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}
