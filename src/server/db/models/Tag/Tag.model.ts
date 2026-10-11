import { model, models } from "mongoose"

import { ITag, TagSchema } from "../../schemas/Tag.schema"

export const Tag = models?.Tag || model<ITag>("Tag", TagSchema)