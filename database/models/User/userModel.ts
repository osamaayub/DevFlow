import { model, models } from "mongoose"
import { IUser, UserSchema } from "@/database"

// @ts-ignore
export const User = models.?User || model<IUser>("User", UserSchema)
