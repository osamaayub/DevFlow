"use client"

import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { use, useOptimistic, useTransition } from "react"
import { toast } from "sonner"

import { CreateVote } from "@/features/votes/actions"
import { applyOptimisticVoteState, type VoteKind, type VoteUIState } from "@/features/votes/vote-state"
import type { VoteParams, VoteState } from "@/shared/types"

import {
  getSignInToVoteMessage,
  getVoteErrorMessage,
  getVoteSuccessMessage
} from "../components/vote-messages"

export function useVote({
  targetId,
  targetType,
  upvotes,
  downvotes,
  hasVotedPromise,
  initialVoteState
}: VoteParams) {
  const session = useSession()
  const router = useRouter()
  const userId = session.data?.user?.id
  const [isPending, startTransition] = useTransition()

  const voteState = hasVotedPromise
    ? use(hasVotedPromise).data
    : initialVoteState

  const [optimisticState, setOptimisticState] = useOptimistic(
    {
      upvotes,
      downvotes,
      hasUpVoted: voteState?.hasUpVoted ?? false,
      hasDownVoted: voteState?.hasDownVoted ?? false
    } satisfies VoteUIState,
    (current, voteType: VoteKind) => applyOptimisticVoteState(current, voteType)
  )

  const handleVote = (voteType: VoteKind) => {
    if (!userId) {
      toast.error(getSignInToVoteMessage(targetType, voteType))
      return
    }

    const before: VoteState = {
      hasUpVoted: optimisticState.hasUpVoted,
      hasDownVoted: optimisticState.hasDownVoted
    }

    startTransition(async () => {
      setOptimisticState(voteType)

      try {
        const result = await CreateVote({
          targetId,
          targetType,
          voteType
        })

        if (!result.success) {
          toast.error(
            getVoteErrorMessage(targetType, voteType, result.error?.message)
          )
          return
        }

        toast.success(getVoteSuccessMessage(targetType, voteType, before))
        router.refresh()
      } catch {
        toast.error(getVoteErrorMessage(targetType, voteType))
      }
    })
  }

  return {
    optimisticState,
    isPending,
    handleVote
  }
}
