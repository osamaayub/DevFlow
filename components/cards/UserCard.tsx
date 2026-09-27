"use client"

import Image from "next/image"
import Link from "next/link"

interface UserCardProps {
  _id: string
  name: string
  username: string
  image?: string
}

const UserCard = ({ _id, name, username, image }: UserCardProps) => {
  return (
    <Link href={`/profile/${_id}`} className="w-full shadow-light100_darknone">
      <article className="background-light900_dark200 light-border flex w-full flex-col items-center justify-center rounded-2xl border p-8 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary-500">
        
        {/* Avatar */}
        {image ? (
          <Image
            src={image}
            alt={name || "User avatar"}
            width={64}
            height={64}
            className="mb-4 h-[100px] w-[100px] rounded-full object-cover"
          />
        ) : (
          <div className="mb-4 flex h-[100px] w-[100px] items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-blue-500">
            <span className="text-2xl font-bold text-white">
              {(name || "User").toUpperCase().slice(0, 2)}
            </span>
          </div>
        )}

        {/* Name and Username - Perfectly centered as per Figma */}
        <div className="mt-4 w-full text-center">
          <h3 className="h3-bold text-dark200_light900 line-clamp-1">
            {name}
          </h3>
          <p className="body-regular text-dark500_light500 mt-1.5 line-clamp-1">
            @{username}
          </p>
        </div>
        
      </article>
    </Link>
  )
}

export default UserCard