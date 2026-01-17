import { model, models } from "mongoose"

// @ts-ignore
import { IUser, UserSchema } from "@/database"

// @ts-ignore
export const User = models.User || model<IUser>("User", UserSchema)
