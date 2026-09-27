import type { UserVoteFlags, VoteKind, VoteTargetType } from "@/lib"

type VoteOutcome = "added" | "removed" | "switched"

function getOutcome(voteType: VoteKind, before: UserVoteFlags): VoteOutcome {
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
  const isAnswer = targetType === "answer"
  const target = isAnswer ? "answer" : "question"
  const outcome = getOutcome(voteType, before)

  if (voteType === "upvote") {
    switch (outcome) {
      case "removed":
        return isAnswer
          ? "Upvote removed — your feedback on this answer was cleared."
          : "Upvote removed from this question."
      case "switched":
        return isAnswer
          ? "Vote updated — you switched this answer to an upvote."
          : "Vote updated — you switched this question to an upvote."
      case "added":
        return isAnswer
          ? "Upvote recorded — thanks for highlighting this answer!"
          : "Upvote recorded on this question."
    }
  }

  switch (outcome) {
    case "removed":
      return isAnswer
        ? "Downvote removed — your feedback on this answer was cleared."
        : "Downvote removed from this question."
    case "switched":
      return isAnswer
        ? "Vote updated — you switched this answer to a downvote."
        : "Vote updated — you switched this question to a downvote."
    case "added":
      return `Downvote recorded on this ${target}.`
  }
}

export function getVoteErrorMessage(
  targetType: VoteTargetType,
  voteType?: VoteKind,
  serverMessage?: string
): string {
  if (serverMessage?.trim()) {
    return serverMessage
  }

  const action =
    voteType === "upvote"
      ? "upvote"
      : voteType === "downvote"
        ? "downvote"
        : "vote"
  const target = targetType === "answer" ? "answer" : "question"

  return `Could not ${action} this ${target}. Check your connection and try again.`
}

export function getSignInToVoteMessage(
  targetType: VoteTargetType,
  voteType?: VoteKind
): string {
  const action =
    voteType === "upvote"
      ? "upvote"
      : voteType === "downvote"
        ? "downvote"
        : "upvote or downvote"
  const target = targetType === "answer" ? "answers" : "questions"

  return `Sign in to ${action} ${target}.`
}
