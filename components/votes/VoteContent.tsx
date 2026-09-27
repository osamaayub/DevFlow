"use client"

import type { VoteParams } from "@/types"

import { useVote } from "./useVote"
import VoteButton from "./VoteButton"

const VoteContent = (props: VoteParams) => {
  const { optimisticState, isPending, handleVote } = useVote(props)

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
