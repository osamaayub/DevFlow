import { getUser } from "@/features/users/actions"
import { ProfileActivity, ProfileHeader, Stats } from "@/features/users/components"
import { auth } from "@/server/auth"
import { RouteParams } from "@/shared/types"

const Profile = async ({ params }: RouteParams) => {
  const { id } = await params
  if (!id) return null

  const [session, result] = await Promise.all([auth(), getUser({ userId: id })])

  if (!result.success || !result.data) {
    return (
      <div className="h1-bold text-dark100_light900">
        {result.error?.message ?? "User not found"}
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
  } = result.data

  return (
    <>
      <ProfileHeader user={user} isOwnProfile={session?.user?.id === id} />

      <Stats
        totalQuestions={totalQuestions}
        totalAnswers={totalAnswers}
        badges={badges}
      />

      <ProfileActivity
        userId={user._id}
        userName={user.name}
        userImage={user.image}
        isOwnProfile={session?.user?.id === id}
        totalQuestions={totalQuestions}
        totalAnswers={totalAnswers}
        hasMoreQuestions={hasMoreQuestions}
        hasMoreAnswers={hasMoreAnswers}
        topQuestions={topQuestions}
        topAnswers={topAnswers}
      />
    </>
  )
}

export default Profile
