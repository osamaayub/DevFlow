import { model, models } from "mongoose";
import { AccountSchema, IAccount } from "@/database";


export const Account=models?.Account || model<IAccount>("Account",AccountSchema);