"use client"

import Link from "next/link"

import { Avatar, AvatarFallback, AvatarImage } from "../ui"

import ROUTES from "@/shared/constants/route"
import { cn } from "@/shared/lib/utils"


interface Props {
  id: string
  name: string
  image?: string | null
  className?: string
  fallbackClassName?: string
  disableLink?: boolean
}

const UserAvatar = ({
  id,
  name,
  image,
  className = "h-9 w-9",
  fallbackClassName,
  disableLink = false,
}: Props) => {
  if (!id || !name) return null

  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const avatarContent = (
    <Avatar className={className}>
      {image && <AvatarImage src={image} alt={name} />}

      <AvatarFallback
        className={cn(
          "primary-gradient font-space-grotesk font-bold tracking-wider text-white",
          fallbackClassName
        )}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  )

  if (disableLink) {
    return avatarContent
  }

  return (
    <Link href={ROUTES.PROFILE(String(id))}>
      {avatarContent}
    </Link>
  )
}

export default UserAvatar

