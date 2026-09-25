import type { UserVoteFlags, VoteKind, VoteTargetType } from "@/lib/vote-state"

const TARGET_LABEL: Record<VoteTargetType, string> = {
  answer: "answer",
  question: "question"
}

type VoteOutcome = "added" | "removed" | "switched"

function outcome(
  voteType: VoteKind,
  before: UserVoteFlags
): VoteOutcome {
  const hadSame =
    voteType === "upvote" ? before.hasUpVoted : before.hasDownVoted
  const hadOpposite =
    voteType === "upvote" ? before.hasDownVoted : before.hasUpVoted

  if (hadSame) return "removed"
  if (hadOpposite) return "switched"
  return "added"
}

export function getVoteSuccessMessage(
  targetType: VoteTargetType,
  voteType: VoteKind,
  before: UserVoteFlags
): string {
  const label = TARGET_LABEL[targetType]
  const voteLabel = voteType === "upvote" ? "Upvote" : "Downvote"
  const result = outcome(voteType, before)

  if (targetType === "answer") {
    switch (result) {
      case "removed":
        return `${voteLabel} removed — your feedback on this answer was cleared.`
      case "switched":
        return `Vote updated — you switched this answer to ${voteType === "upvote" ? "an upvote" : "a downvote"}.`
      case "added":
        return voteType === "upvote"
          ? "Upvote recorded — thanks for highlighting this answer!"
          : "Downvote recorded on this answer."
    }
  }

  switch (result) {
    case "removed":
      return `${voteLabel} removed from this ${label}.`
    case "switched":
      return `Vote updated — you switched this ${label} to ${voteType === "upvote" ? "an upvote" : "a downvote"}.`
    case "added":
      return `${voteLabel} recorded on this ${label}.`
  }
}

export function getVoteErrorMessage(
  targetType: VoteTargetType,
  serverMessage?: string
): string {
  if (serverMessage?.trim()) {
    return serverMessage
  }

  return targetType === "answer"
    ? "Could not update your vote on this answer. Check your connection and try again."
    : "Could not update your vote on this question. Check your connection and try again."
}

export function getSignInToVoteMessage(targetType: VoteTargetType): string {
  return targetType === "answer"
    ? "Sign in to upvote or downvote answers."
    : "Sign in to upvote or downvote questions."
}
