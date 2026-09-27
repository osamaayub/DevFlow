"use client"

import Image from "next/image"

import { formatNumber, type VoteKind } from "@/lib"

const VOTE_ICONS: Record<
  VoteKind,
  { active: string; inactive: string; alt: string; label: string }
> = {
  upvote: {
    active: "/icons/upvoted.svg",
    inactive: "/icons/upvote.svg",
    alt: "Upvote icon",
    label: "UpVote"
  },
  downvote: {
    active: "/icons/downvoted.svg",
    inactive: "/icons/downvote.svg",
    alt: "Downvote icon",
    label: "Down Vote"
  }
}

interface VoteButtonProps {
  type: VoteKind
  count: number
  isActive: boolean
  isPending: boolean
  onVote: (type: VoteKind) => void
}

const VoteButton = ({
  type,
  count,
  isActive,
  isPending,
  onVote
}: VoteButtonProps) => {
  const icon = VOTE_ICONS[type]

  return (
    <div className="flex-center gap-1.5">
      <Image
        src={isActive ? icon.active : icon.inactive}
        alt={icon.alt}
        width={18}
        height={18}
        className={`cursor-pointer ${isPending ? "opacity-50" : ""}`}
        aria-label={icon.label}
        onClick={() => !isPending && onVote(type)}
      />
      <div className="flex-center background-light700_dark400 min-w-5 rounded-sm p-1">
        <p className="subtle-medium text-dark400_light900">{formatNumber(count)}</p>
      </div>
    </div>
  )
}

export default VoteButton
