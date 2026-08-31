import { model, models } from "mongoose"

import { IUser } from "./userSchema"
import { UserSchema } from "./userSchema"

export const User = models?.User || model<IUser>("User", UserSchema)
