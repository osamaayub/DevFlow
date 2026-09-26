"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { formatNumber } from "@/lib"
import { getVoteSuccessMessage,getVoteErrorMessage } from "@/lib"
import { CreateVote } from "@/lib/actions/vote.action"
import { VoteParams, VoteState } from "@/types"

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
        setUpvotes((count:number) => count - 1)
        setHasUpVoted(false)
        return
      }
      if (hasDownVoted) {
        setDownvotes((count:number) => count - 1)
        setHasDownVoted(false)
      }
      setUpvotes((count:number) => count + 1)
      setHasUpVoted(true)
      return
    }

    if (hasDownVoted) {
      setDownvotes((count:number) => count - 1)
      setHasDownVoted(false)
      return
    }
    if (hasUpVoted) {
      setUpvotes((count:number) => count - 1)
      setHasUpVoted(false)
    }
    setDownvotes((count:number) => count + 1)
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
