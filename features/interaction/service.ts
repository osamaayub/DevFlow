import "server-only"

import mongoose from "mongoose"

import { IInteraction, Interaction, InteractionActionEnums, User } from "@/server/db"
import { dbConnect } from "@/server/db/connect"
import { UpdateInteractionParams } from "@/shared/types/action"

/** Reputation changes per action: who performed it and who authored the content */
const REPUTATION_POINTS = {
    upvote: { performer: 2, author: 10 },
    downvote: { performer: -1, author: -2 },
    post: { question: 5, answer: 10 },
    delete: { question: -5, answer: -10 },
} as const

/**
 * Updates reputation for an interaction inside the caller's transaction. It throws on
 * failure so the transaction rolls back instead of saving an interaction without its
 * reputation change.
 */
const updateReputation = async ({
    interaction,
    session,
    performerId,
    authorId,
    undo = false,
}: UpdateInteractionParams): Promise<void> => {
    const { action: actionType, actionType: target } = interaction

    let performerPoints = 0
    let authorPoints = 0

    switch (actionType) {
        case "upvote":
            performerPoints = REPUTATION_POINTS.upvote.performer
            authorPoints = REPUTATION_POINTS.upvote.author
            break
        case "downvote":
            performerPoints = REPUTATION_POINTS.downvote.performer
            authorPoints = REPUTATION_POINTS.downvote.author
            break
        case "post":
            if (!target) return
            authorPoints = REPUTATION_POINTS.post[target]
            break
        case "delete":
            if (!target) return
            authorPoints = REPUTATION_POINTS.delete[target]
            break
        default:
            // view, bookmark, search and edit don't change reputation
            return
    }

    // Removing or switching a vote gives back exactly what the vote earned
    if (undo) {
        performerPoints = -performerPoints
        authorPoints = -authorPoints
    }

    // Acting on your own content only applies the author change, so self-votes can't farm points
    if (performerId === authorId) {
        if (authorPoints !== 0) {
            await User.findByIdAndUpdate({ _id: authorId }, { $inc: { reputation: authorPoints } }, { session, new: true })
        }
        return
    }

    const updates = [
        { id: performerId, points: performerPoints },
        { id: authorId, points: authorPoints },
    ].filter(({ points }) => points !== 0)

    if (updates.length === 0) return

    await User.bulkWrite(
        updates.map(({ id, points }) => ({
            updateOne: {
                filter: { _id: id },
                update: { $inc: { reputation: points } },
            },
        })),
        { session }
    )
}

export interface RecordInteractionInput {
    /** The signed-in user who performed the action */
    userId: string
    action: (typeof InteractionActionEnums)[number]
    /** The question or answer acted on; omitted for searches */
    actionTarget?: "question" | "answer"
    actionId?: string
    /** Owner of the question or answer, for reputation; omitted when nothing is owned (searches) */
    authorId?: string
    /** Search text, for "search" interactions */
    query?: string
    /** Reverses the reputation change, e.g. when a vote is removed or switched */
    undo?: boolean
}

/**
 * Saves an interaction and its reputation change in one transaction.
 *
 * Server-only and not a server action: it trusts its input, so only server code that has
 * already identified the user may call it. Pages use it directly (for example from after(),
 * where the session cookie can't be read), and createInteraction calls it after its own
 * sign-in check.
 */
export async function recordInteraction({
    userId,
    action,
    actionTarget,
    actionId,
    authorId,
    query,
    undo,
}: RecordInteractionInput): Promise<IInteraction> {
    await dbConnect()
    const session = await mongoose.startSession()

    try {
        let created: unknown

        // withTransaction commits on success, aborts on any throw and retries transient errors
        await session.withTransaction(async () => {
            const [interaction] = await Interaction.create(
                [{
                    user: userId,
                    action,
                    // The model stores the target type as actionType ("question" | "answer")
                    actionType: actionTarget,
                    actionId,
                    query,
                }],
                { session }
            )

            if (authorId) {
                await updateReputation({ interaction, session, performerId: userId, authorId, undo })
            }
            created = interaction
        })

        return JSON.parse(JSON.stringify(created)) as IInteraction
    } finally {
        await session.endSession()
    }
}
