import { model, models } from "mongoose"
import { IUser, UserSchema } from "@/Database/models"

export const User = models.user || model<IUser>("User", UserSchema)
