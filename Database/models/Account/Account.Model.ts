import { model } from "mongoose";
import { AccountSchema, IAccount } from "./Account.schema";


export const AccountModel=model<IAccount>("Account",AccountSchema);