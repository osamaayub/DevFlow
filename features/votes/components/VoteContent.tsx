"use client"

import { useSession } from "next-auth/react"

import type { VoteParams } from "@/shared/types"

import VoteButton from "./VoteButton"
import { useVote } from "../hooks/useVote"

const VoteContent = (props: VoteParams) => {
  const session = useSession()
  const { optimisticState, isPending, handleVote } = useVote(props)

  if (session.status !== "authenticated" || !session.data?.user?.id) {
    return null
  }

  return (
    <div className="flex-center gap-2.5">
      <VoteButton
        type="upvote"
        count={optimisticState.upvotes}
        isActive={optimisticState.hasUpVoted}
        isPending={isPending}
        onVote={handleVote}
      />
      <VoteButton
        type="downvote"
        count={optimisticState.downvotes}
        isActive={optimisticState.hasDownVoted}
        isPending={isPending}
        onVote={handleVote}
      />
    </div>
  )
}

export default VoteContent
