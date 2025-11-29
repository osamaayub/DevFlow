import { model, models } from "mongoose";
import { AccountSchema, IAccount } from "./Account.schema";


export const AccountModel=models?.Account || model<IAccount>("Account",AccountSchema);