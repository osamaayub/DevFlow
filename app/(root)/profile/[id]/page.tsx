import type { Metadata, ResolvingMetadata } from "next"
import { notFound } from "next/navigation"

import { getUser, getUserStats } from "@/features/users/actions"
import {
  ProfileActivity,
  ProfileHeader,
  Stats,
  UserTopTags,
} from "@/features/users/components"
import { auth } from "@/server/auth"
import { getSiteUrl } from "@/shared/lib/seo"
import { RouteParams } from "@/shared/types"

export async function generateMetadata(
  { params }: RouteParams,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params
  const result = await getUser({ userId: id })
  const user = result.success ? result.data?.user : undefined
  if (!user) return { title: "Profile not found", robots: { index: false, follow: false } }

  const title = `${user.name}'s Developer Profile`
  const description = `View ${user.name}'s programming questions, answers, and developer activity on DevFlow.`
  const url = `${getSiteUrl()}/profile/${id}`
  const previousImages = (await parent).openGraph?.images ?? []
  const profileImages = user.image ? [user.image] : ["/images/logo.png"]
  return {
    title,
    description,
    keywords: [user.name, "developer profile", "programming community"],
    authors: [{ name: user.name }],
    alternates: { canonical: url },
    openGraph: {
      type: "profile",
      url,
      title,
      description,
      siteName: "DevFlow",
      images: [...profileImages, ...previousImages],
    },
    twitter: { card: "summary", title, description, images: profileImages },
  }
}

const Profile = async ({ params }: RouteParams) => {
  const { id } = await params
  if (!id) return notFound();

  const [session, { success, data, error }, { data: userStats }] = await Promise.all([
    auth(),
    getUser({ userId: id }),
    getUserStats({ userId: id }),
  ])

  if (!success || !data) {
    return (
      <div className="h1-bold text-dark100_light900">
        {error?.message ?? "User not found"}
      </div>
    )
  }

  const {
    user,
    totalQuestions,
    totalAnswers,
    hasMoreQuestions,
    hasMoreAnswers,
    topQuestions,
    topAnswers,
    topTags,
  } = data
  const isOwnProfile =
    session?.user?.id != null && String(session.user.id) === String(user._id)
  return (
    <>
      <ProfileHeader user={user} isOwnProfile={isOwnProfile} />

      <Stats
        totalQuestions={userStats?.totalQuestions || 0}
        totalAnswers={userStats?.totalAnswers || 0}
        badges={userStats?.badges || { GOLD: 0, SILVER: 0, BRONZE: 0 }}
        reputationPoints={user.reputation || 0}
      />

      <div className="grid min-w-0 grid-cols-1 gap-x-10 lg:grid-cols-[minmax(0,1fr)_260px]">
        <ProfileActivity
          userId={user._id}
          userName={user.name}
          userImage={user.image}
          isOwnProfile={isOwnProfile}
          totalQuestions={totalQuestions}
          totalAnswers={totalAnswers}
          hasMoreQuestions={hasMoreQuestions}
          hasMoreAnswers={hasMoreAnswers}
          topQuestions={topQuestions}
          topAnswers={topAnswers}
        />

        <UserTopTags tags={topTags} />
      </div>
    </>
  )
}

export default Profile
