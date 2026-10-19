'use server'

import { recordInteraction } from "@/features/interaction/service"
import { action } from "@/server/action"
import { IInteraction } from "@/server/db"
import { HandleError } from "@/server/errors/error-handler"
import { CreateInteractionSchema } from "@/shared/lib/validation"
import { CreateInteractionParams } from "@/shared/types/action"
import { ActionResponse, ErrorResponse } from "@/shared/types/global"

/**
 * Records an interaction for the signed-in user and applies its reputation change.
 * The saving and reputation logic lives in recordInteraction (features/interaction/service).
 */
export const createInteraction = async (params: CreateInteractionParams): Promise<ActionResponse<IInteraction>> => {
    const validationResult = await action({
        params,
        schema: CreateInteractionSchema,
        authorize: true
    })
    if (validationResult instanceof Error) {
        return HandleError(validationResult) as unknown as ErrorResponse
    }

    const { action: actionType, actionTarget, actionId, authorId, undo } = validationResult.validatedData
    const userId = validationResult.session?.user?.id
    if (!userId) {
        return HandleError(new Error('User not authenticated')) as unknown as ErrorResponse
    }

    try {
        const interaction = await recordInteraction({
            userId,
            action: actionType,
            actionTarget,
            actionId,
            authorId,
            undo,
        })
        return { success: true, data: interaction }
    } catch (error: unknown) {
        return HandleError(new Error(`Failed to create interaction, ${error}`)) as unknown as ErrorResponse
    }
}
