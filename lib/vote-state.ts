export type VoteKind = "upvote" | "downvote"
export type VoteTargetType = "question" | "answer"

export interface VoteUIState {
  upvotes: number
  downvotes: number
  hasUpVoted: boolean
  hasDownVoted: boolean
}

export type UserVoteFlags = Pick<VoteUIState, "hasUpVoted" | "hasDownVoted">

/** Next UI state after a vote click (matches server toggle / switch rules). */
export function applyOptimisticVoteState(
  state: VoteUIState,
  voteType: VoteKind
): VoteUIState {
  if (voteType === "upvote") {
    if (state.hasUpVoted) {
      return { ...state, upvotes: state.upvotes - 1, hasUpVoted: false }
    }

    return {
      ...state,
      upvotes: state.upvotes + 1,
      downvotes: state.hasDownVoted ? state.downvotes - 1 : state.downvotes,
      hasUpVoted: true,
      hasDownVoted: false
    }
  }

  if (state.hasDownVoted) {
    return { ...state, downvotes: state.downvotes - 1, hasDownVoted: false }
  }

  return {
    ...state,
    downvotes: state.downvotes + 1,
    upvotes: state.hasUpVoted ? state.upvotes - 1 : state.upvotes,
    hasDownVoted: true,
    hasUpVoted: false
  }
}
