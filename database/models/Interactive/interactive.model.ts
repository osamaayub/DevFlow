import { model, models } from "mongoose"

import { InteractionSchema, IInteraction } from "../../schemas/Interaction.schema"

export const Interaction = models?.Interaction || model<IInteraction>("Interaction", InteractionSchema)