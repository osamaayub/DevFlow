import {model,models}from "mongoose";

import {InteractionSchema, IInteraction } from "./interative.schema";

export const Interaction = models?.Interaction || model<IInteraction>("Interaction", InteractionSchema);