import { model, models } from "mongoose"

import { IAccount,AccountSchema } from "./Account.schema"

export const Account = models?.Account || model<IAccount>("Account", AccountSchema)