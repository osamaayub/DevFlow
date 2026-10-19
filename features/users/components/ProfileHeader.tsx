import Link from "next/link"

import { IUser } from "@/server/db"
import { UserAvatar } from "@/shared/components/common"
import { Button } from "@/shared/components/ui"
import { formatJoinedAt } from "@/shared/lib/date"

import ProfileLink from "./ProfileLink"

interface Props {
  user: IUser
  isOwnProfile: boolean
}

const ProfileHeader = ({ user, isOwnProfile }: Props) => {
  const {
    _id,
    name,
    username,
    image,
    bio,
    location,
    portfolio,
    joinedAt,
    createdAt,
  } = user
  const profileJoinedAt = joinedAt ?? createdAt
  const profileLocation = location?.trim()
  const profileBio = bio?.trim()
  const profilePortfolio = portfolio?.trim()
  const portfolioLabel = profilePortfolio
    ?.replace(/^https?:\/\//, "")
    .replace(/\/$/, "")

  return (
    <section
      className="grid min-w-0 grid-cols-[72px_minmax(0,1fr)] items-start gap-x-3 gap-y-4 xs:grid-cols-[88px_minmax(0,1fr)] sm:grid-cols-[120px_minmax(0,1fr)_auto] sm:gap-x-5"
    >
      <div className="size-[72px] shrink-0 rounded-full border-2 border-primary-500 p-0.5 xs:size-[88px] sm:size-[120px] sm:p-1">
        <UserAvatar
          id={_id}
          name={name}
          image={image}
          disableLink
          className="size-full rounded-full object-cover"
          fallbackClassName="text-3xl xs:text-4xl sm:text-5xl"
        />
      </div>

      <div className="min-w-0 pt-0.5 sm:pt-2">
        <h1 className="break-words text-[clamp(1rem,2.2vw,1.5rem)] leading-tight font-bold text-dark100_light900">
          {name}
        </h1>
        <p className="small-medium break-all text-dark200_light800">@{username}</p>

        <div className="mt-3 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2 sm:mt-4 sm:gap-x-4">
          {profilePortfolio && portfolioLabel && (
            <ProfileLink
              imgUrl="/icons/link.svg"
              href={profilePortfolio}
              title={portfolioLabel}
            />
          )}
          {profileLocation && (
            <ProfileLink imgUrl="/icons/location.svg" title={profileLocation} />
          )}
          {profileJoinedAt && (
            <ProfileLink
              imgUrl="/icons/calendar.svg"
              title={`Joined ${formatJoinedAt(profileJoinedAt)}`}
            />
          )}
        </div>

      </div>

      {isOwnProfile && (
        <div className="col-span-2 row-start-2 flex justify-end sm:col-span-1 sm:col-start-3 sm:row-start-1">
          <Link href="/profile/edit" className="block w-full sm:w-auto">
            <Button className="body-medium btn-secondary text-dark300_light900 min-h-11 w-full min-w-44 px-4 py-3 sm:w-auto">
              Edit Profile
            </Button>
          </Link>
        </div>
      )}

      {profileBio && (
        <p
          className={`paragraph-regular whitespace-pre-line text-dark400_light800 ${
            isOwnProfile
              ? "col-span-2 row-start-3 min-w-0 sm:col-span-2 sm:col-start-2 sm:row-start-2"
              : "col-span-2 row-start-2 min-w-0 sm:col-span-1 sm:col-start-2 sm:row-start-2"
          }`}
        >
          {profileBio}
        </p>
      )}
    </section>
  )
}

export default ProfileHeader
