"use client"

import Link from "next/link"

import ROUTES from "@/constants/route"
import { cn } from "@/lib/utils"

import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar"

interface Props {
  id: string
  name: string
  image?: string | null
  className?: string
  fallbackClassName?: string
}

const UserAvatar = ({ id, name, image, className = "h-9 w-9", fallbackClassName }: Props) => {
  // Guard against missing data
  if (!id || !name) return null

  const initials = name
    .split(" ")
    .map((word: string) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <Link href={ROUTES.PROFILE(id)}>
      <Avatar className={className}>
        {image && <AvatarImage src={image} alt={name} />}
        <AvatarFallback className={cn("primary-gradient font-space-grotesk font-bold tracking-wider text-white", fallbackClassName)}>
          {initials}
        </AvatarFallback>
      </Avatar>
    </Link>
  )
}

export default UserAvatar