"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { formatNumber } from "@/lib"
import { CreateVote } from "@/lib/actions/vote.action"

interface VoteParams {
  targetId: string
  targetType: "question" | "answer"
  upvotes: number
  downvotes: number
  hasUpVoted: boolean
  hasDownVoted: boolean
}

type VoteState = Pick<VoteParams, "hasUpVoted" | "hasDownVoted">

function getVoteSuccessMessage(
  targetType: VoteParams["targetType"],
  voteType: "upvote" | "downvote",
  before: VoteState
): string {
  const isAnswer = targetType === "answer"
  const subject = isAnswer ? "this answer" : "this question"

  if (voteType === "upvote") {
    if (before.hasUpVoted) {
      return isAnswer
        ? "Upvote removed — your feedback on this answer was cleared."
        : "Upvote removed from this question."
    }
    if (before.hasDownVoted) {
      return isAnswer
        ? "Vote updated — you switched this answer to an upvote."
        : "Vote updated — you switched this question to an upvote."
    }
    return isAnswer
      ? "Upvote recorded — thanks for highlighting this answer!"
      : "Upvote recorded on this question."
  }

  if (before.hasDownVoted) {
    return isAnswer
      ? "Downvote removed — your feedback on this answer was cleared."
      : "Downvote removed from this question."
  }
  if (before.hasUpVoted) {
    return isAnswer
      ? "Vote updated — you switched this answer to a downvote."
      : "Vote updated — you switched this question to a downvote."
  }
  return isAnswer
    ? "Downvote recorded on this answer."
    : "Downvote recorded on this question."
}

function getVoteErrorMessage(
  targetType: VoteParams["targetType"],
  serverMessage?: string
): string {
  if (serverMessage?.trim()) {
    return serverMessage
  }

  return targetType === "answer"
    ? "Could not update your vote on this answer. Check your connection and try again."
    : "Could not update your vote on this question. Check your connection and try again."
}

const Votes = ({
  targetId,
  targetType,
  upvotes: initialUpvotes,
  downvotes: initialDownvotes,
  hasUpVoted: initialHasUpVoted,
  hasDownVoted: initialHasDownVoted
}: VoteParams) => {
  const session = useSession()
  const router = useRouter()
  const userId = session.data?.user?.id

  const [upvotes, setUpvotes] = useState(initialUpvotes)
  const [downvotes, setDownvotes] = useState(initialDownvotes)
  const [hasUpVoted, setHasUpVoted] = useState(initialHasUpVoted)
  const [hasDownVoted, setHasDownVoted] = useState(initialHasDownVoted)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setUpvotes(initialUpvotes)
    setDownvotes(initialDownvotes)
    setHasUpVoted(initialHasUpVoted)
    setHasDownVoted(initialHasDownVoted)
  }, [initialUpvotes, initialDownvotes, initialHasUpVoted, initialHasDownVoted])

  const applyOptimisticVote = (voteType: "upvote" | "downvote") => {
    if (voteType === "upvote") {
      if (hasUpVoted) {
        setUpvotes((count) => count - 1)
        setHasUpVoted(false)
        return
      }
      if (hasDownVoted) {
        setDownvotes((count) => count - 1)
        setHasDownVoted(false)
      }
      setUpvotes((count) => count + 1)
      setHasUpVoted(true)
      return
    }

    if (hasDownVoted) {
      setDownvotes((count) => count - 1)
      setHasDownVoted(false)
      return
    }
    if (hasUpVoted) {
      setUpvotes((count) => count - 1)
      setHasUpVoted(false)
    }
    setDownvotes((count) => count + 1)
    setHasDownVoted(true)
  }

  const handleVote = async (voteType: "upvote" | "downvote") => {
    if (!userId) {
      return toast.error(
        targetType === "answer"
          ? "Sign in to upvote or downvote answers."
          : "Sign in to upvote or downvote questions."
      )
    }

    const previous = { upvotes, downvotes, hasUpVoted, hasDownVoted }
    const voteStateBefore: VoteState = {
      hasUpVoted: previous.hasUpVoted,
      hasDownVoted: previous.hasDownVoted
    }
    setIsLoading(true)
    applyOptimisticVote(voteType)

    try {
      const result = await CreateVote({
        targetId,
        targetType,
        voteType
      })

      if (!result.success) {
        setUpvotes(previous.upvotes)
        setDownvotes(previous.downvotes)
        setHasUpVoted(previous.hasUpVoted)
        setHasDownVoted(previous.hasDownVoted)
        toast.error(getVoteErrorMessage(targetType, result.error?.message))
        return
      }

      if (targetType === "answer") {
        toast.success(getVoteSuccessMessage(targetType, voteType, voteStateBefore))
      }

      router.refresh()
    } catch {
      setUpvotes(previous.upvotes)
      setDownvotes(previous.downvotes)
      setHasUpVoted(previous.hasUpVoted)
      setHasDownVoted(previous.hasDownVoted)
      toast.error(getVoteErrorMessage(targetType))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-center gap-2.5">
      <div className="flex-center gap-1.5">
        <Image
          src={hasUpVoted ? "/icons/upvoted.svg" : "/icons/upvote.svg"}
          alt="Upvote icon"
          width={18}
          height={18}
          className={`cursor-pointer ${isLoading && "opacity-50"}`}
          aria-label="UpVote"
          onClick={() => !isLoading && handleVote("upvote")}
        />
        <div className="flex-center  background-light700_dark400 min-w-5 rounded-sm p-1">
          <p className="subtle-medium text-dark400_light900">{formatNumber(upvotes)}</p>
        </div>
      </div>

      <div className="flex-center gap-1.5">
        <Image
          src={hasDownVoted ? "/icons/downvoted.svg" : "/icons/downvote.svg"}
          alt="Downvote icon"
          width={18}
          height={18}
          className={`cursor-pointer ${isLoading && "opacity-50"}`}
          aria-label="Down Vote"
          onClick={() => !isLoading && handleVote("downvote")}
        />
        <div className="flex-center  background-light700_dark400 min-w-5 rounded-sm p-1">
          <p className="subtle-medium text-dark400_light900">{formatNumber(downvotes)}</p>
        </div>
      </div>
    </div>
  )
}

export default Votes
