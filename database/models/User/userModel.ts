import { model, models } from "mongoose"

import { IUser, UserSchema } from "@/database/models/User";

export const User = models?.User || model<IUser>("User", UserSchema);
