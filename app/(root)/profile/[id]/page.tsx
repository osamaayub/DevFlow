import { notFound } from "next/navigation"

import { getUser } from "@/features/users/actions"
import {
  ProfileActivity,
  ProfileHeader,
  Stats,
  UserTopTags,
} from "@/features/users/components"
import { auth } from "@/server/auth"
import { RouteParams } from "@/shared/types"

const Profile = async ({ params }: RouteParams) => {
  const { id } = await params
  if (!id) return notFound();

  const [session, { success, data, error }] = await Promise.all([
    auth(),
    getUser({ userId: id }),
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
    badges,
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
        totalQuestions={totalQuestions}
        totalAnswers={totalAnswers}
        badges={badges}
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
