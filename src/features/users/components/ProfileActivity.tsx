"use client"

import { Pagination } from "@/shared/components/navigation/Pagination"

import type { TopAnswer, TopQuestion } from "./ProfileActivityCards"
import ProfileActivityError from "./ProfileActivityError"
import ProfileActivityList from "./ProfileActivityList"
import ProfileActivityTabs from "./ProfileActivityTabs"
import { useProfileActivity } from "./useProfileActivity"

interface Props {
  userId: string
  userName: string
  userImage: string
  isOwnProfile: boolean
  totalQuestions: number
  totalAnswers: number
  hasMoreQuestions: boolean
  hasMoreAnswers: boolean
  topQuestions: TopQuestion[]
  topAnswers: TopAnswer[]
}

const ProfileActivity = ({
  userId,
  userName,
  userImage,
  isOwnProfile,
  totalQuestions,
  totalAnswers,
  hasMoreQuestions: initialHasMoreQuestions,
  hasMoreAnswers: initialHasMoreAnswers,
  topQuestions,
  topAnswers,
}: Props) => {
  const {
    activityType,
    page,
    questions,
    answers,
    hasMoreQuestions,
    hasMoreAnswers,
    isLoading,
    error,
    handleTabChange,
    handlePageChange,
    removeQuestion,
    removeAnswer,
  } = useProfileActivity({
    userId,
    topQuestions,
    topAnswers,
    hasMoreQuestions: initialHasMoreQuestions,
    hasMoreAnswers: initialHasMoreAnswers,
  })

  const isQuestionActivity = activityType === "questions"
  const currentItems = isQuestionActivity ? questions : answers
  const currentTotal = isQuestionActivity ? totalQuestions : totalAnswers
  const hasMore = isQuestionActivity ? hasMoreQuestions : hasMoreAnswers
  const currentCount = currentItems.length

  return (
    <div className="mt-8 grid min-w-0 grid-cols-1 gap-8 sm:mt-10">
      <section className="min-w-0">
        <ProfileActivityTabs
          activityType={activityType}
          onSelect={handleTabChange}
        />

        <ProfileActivityList
          activityType={activityType}
          questions={questions}
          answers={answers}
          userId={userId}
          userName={userName}
          userImage={userImage}
          isOwnProfile={isOwnProfile}
          isLoading={isLoading}
          onDeleteQuestion={removeQuestion}
          onDeleteAnswer={removeAnswer}
        />

        <ProfileActivityError error={error} />

        {currentItems.length > 0 && (
          <Pagination
            pageNumber={page}
            isNext={hasMore}
            onPageChange={handlePageChange}
          />
        )}

        <span className="sr-only" aria-live="polite">
          Showing {currentCount} of {currentTotal}{" "}
          {isQuestionActivity ? "posts" : "answers"}
        </span>
      </section>
    </div>
  )
}

export default ProfileActivity
