import { model, models } from "mongoose"
import { IUser, UserSchema } from "@/Database/models"

export const User = models.?User || model<IUser>("User", UserSchema)
