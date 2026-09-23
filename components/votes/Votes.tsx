"use client"

import Image from "next/image"
import { useSession } from "next-auth/react"
import { useState } from "react"
import { toast } from "sonner"

import { formatNumber, HandleError } from "@/lib"

interface VoteParams {
  upvotes: number
  downvotes: number
  hasUpVoted: boolean
  hasDownVoted: boolean
}

const Votes = ({ upvotes, downvotes, hasUpVoted, hasDownVoted }: VoteParams) => {
    const session= useSession();
    const userId=session.data?.user?.id;
  const [isLoading, setIsLoading] = useState(false)

  const handleVote = async (voteType: "upvote" | "downvote") => {
    if(!userId)
        return toast.error("Please log in to vote")
    setIsLoading(true);
    try{
     const voteAction = voteType === "upvote" ? "Upvote" : "Downvote"
     const voteStatus = voteType === "upvote" ? (hasUpVoted ? "removed" : "added") : (hasDownVoted ? "removed" : "added")
     toast.success(`${voteAction} ${voteStatus}`)
    }
    catch(error){
        toast.error("Failed to vote. Please try again.")
        return HandleError(String(error)) as unknown as ErrorResponse;
    }
    finally{
        setIsLoading(false);
    }
  }


  return (
    <div className="flex-center gap-2.5">
      {/* Upvote Section */}
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

      {/* Downvote Section */}
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