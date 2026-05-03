import {models,model}from "mongoose";
import { IVote, VoteSchema } from "./vote.schema";

export const Vote = models?.Vote || model<IVote>("Vote", VoteSchema);