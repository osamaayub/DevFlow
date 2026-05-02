import { model, models} from "mongoose";
import {ITag, TagSchema} from "./Tag.schema";

export const Tag =models?.Tag || model<ITag>("Tag",TagSchema);