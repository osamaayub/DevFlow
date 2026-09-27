"use client"

import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { use, useOptimistic, useTransition } from "react"
import { toast } from "sonner"

import {
  applyOptimisticVoteState,
  CreateVote,
  type VoteKind,
  type VoteUIState
} from "@/lib"
import type { VoteParams, VoteState } from "@/types"

import {
  getSignInToVoteMessage,
  getVoteErrorMessage,
  getVoteSuccessMessage
} from "./vote-messages"

export function useVote({
  targetId,
  targetType,
  upvotes,
  downvotes,
  hasVotedPromise
}: VoteParams) {
  const session = useSession()
  const router = useRouter()
  const userId = session.data?.user?.id
  const [isPending, startTransition] = useTransition()

  const { data } = use(hasVotedPromise)

  const [optimisticState, setOptimisticState] = useOptimistic(
    {
      upvotes,
      downvotes,
      hasUpVoted: data?.hasUpVoted ?? false,
      hasDownVoted: data?.hasDownVoted ?? false
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
