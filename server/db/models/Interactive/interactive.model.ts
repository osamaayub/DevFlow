import { deleteModel, model, models } from "mongoose"

import { InteractionSchema, IInteraction } from "../../schemas/Interaction.schema"

// In development, hot reloads keep the previously compiled model alive. Reusing it after
// the schema changes silently drops new fields (actionId, actionType), which made
// interactions save without a target and skip their reputation change. Rebuild it instead.
if (process.env.NODE_ENV !== "production" && models?.Interaction) {
  deleteModel("Interaction")
}

export const Interaction = models?.Interaction || model<IInteraction>("Interaction", InteractionSchema)
