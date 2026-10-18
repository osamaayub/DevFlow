import type { ActivityType } from "./ProfileActivity.types"
import type { TopAnswer, TopQuestion } from "./ProfileActivityCards"
import {
  ProfileAnswerCard,
  ProfileQuestionCard,
} from "./ProfileActivityCards"

const getEmptyStateMessage = (activityType: ActivityType) =>
  activityType === "questions" ? "No posts yet." : "No answers yet."

interface ProfileActivityListProps {
  activityType: ActivityType
  questions: TopQuestion[]
  answers: TopAnswer[]
  userId: string
  userName: string
  userImage: string
  isOwnProfile: boolean
  isLoading: boolean
  onDeleteQuestion: (questionId: string) => Promise<boolean>
  onDeleteAnswer: (answerId: string) => Promise<boolean>
}

const ProfileActivityList = ({
  activityType,
  questions,
  answers,
  userId,
  userName,
  userImage,
  isOwnProfile,
  isLoading,
  onDeleteQuestion,
  onDeleteAnswer,
}: ProfileActivityListProps) => {
  const isQuestionActivity = activityType === "questions"
  const currentItems = isQuestionActivity ? questions : answers

  if (isQuestionActivity) {
    return (
      <div className="flex flex-col gap-4">
        {questions.map((question) => (
          <ProfileQuestionCard
            key={question._id}
            question={question}
            userId={userId}
            userName={userName}
            userImage={userImage}
            isOwnProfile={isOwnProfile}
            isLoading={isLoading}
            onDelete={onDeleteQuestion}
          />
        ))}

        {currentItems.length === 0 && (
          <p className="body-regular py-6 text-dark400_light700">
            {getEmptyStateMessage(activityType)}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {answers.map((answer) => (
        <ProfileAnswerCard
          key={answer._id}
          answer={answer}
          isOwnProfile={isOwnProfile}
          isLoading={isLoading}
          onDelete={onDeleteAnswer}
          userId={userId}
          userName={userName}
          userImage={userImage}
        />
      ))}

      {currentItems.length === 0 && (
        <p className="body-regular py-6 text-dark400_light700">
          {getEmptyStateMessage(activityType)}
        </p>
      )}
    </div>
  )
}

export default ProfileActivityList
