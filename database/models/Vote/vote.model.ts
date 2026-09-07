import { models, model } from "mongoose"

import { IVote, VoteSchema } from "../../schemas/Vote.schema"

export const Vote = models?.Vote || model<IVote>("Vote", VoteSchema)