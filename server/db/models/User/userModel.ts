import { model, models } from "mongoose"

import { IUser } from "../../schemas/User.schema"
import { UserSchema } from "../../schemas/User.schema"

export const User = models?.User || model<IUser>("User", UserSchema)
