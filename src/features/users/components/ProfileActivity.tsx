"use client"

import { useRouter } from "next/navigation"
import { useReducer } from "react"

import { deleteQuestion } from "@/features/questions/actions"
import { getUserActivity } from "@/features/users/actions"

import type { ActivityType } from "./ProfileActivity.types"
import type { TopAnswer, TopQuestion } from "./ProfileActivityCards"
import ProfileActivityError from "./ProfileActivityError"
import ProfileActivityList from "./ProfileActivityList"
import ProfileActivityLoadMore from "./ProfileActivityLoadMore"
import ProfileActivityTabs from "./ProfileActivityTabs"

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

const PAGE_SIZE = 3

interface ActivityState {
  activityType: ActivityType
  questions: TopQuestion[]
  answers: TopAnswer[]
  hasMoreQuestions: boolean
  hasMoreAnswers: boolean
  isLoading: boolean
  error: string
}

type ActivityAction =
  | { type: "select"; activityType: ActivityType }
  | { type: "request-start" }
  | { type: "request-end" }
  | { type: "request-error"; error: string }
  | {
      type: "activity-loaded"
      activityType: ActivityType
      questions: TopQuestion[]
      answers: TopAnswer[]
      isNext: boolean
    }

const activityReducer = (
  state: ActivityState,
  action: ActivityAction
): ActivityState => {
  switch (action.type) {
    case "select":
      return { ...state, activityType: action.activityType, error: "" }

    case "request-start":
      return { ...state, isLoading: true, error: "" }

    case "request-end":
      return { ...state, isLoading: false }

    case "request-error":
      return { ...state, error: action.error }

    case "activity-loaded": {
      if (action.activityType === "questions") {
        return {
          ...state,
          questions: [...state.questions, ...action.questions],
          hasMoreQuestions: action.isNext,
        }
      }

      return {
        ...state,
        answers: [...state.answers, ...action.answers],
        hasMoreAnswers: action.isNext,
      }
    }

    default:
      return state
  }
}

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback

const getNextPageNumber = (count: number) => Math.floor(count / PAGE_SIZE) + 1

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
  const router = useRouter()
  const [state, dispatch] = useReducer(activityReducer, {
    activityType: "questions",
    questions: topQuestions,
    answers: topAnswers,
    hasMoreQuestions: initialHasMoreQuestions,
    hasMoreAnswers: initialHasMoreAnswers,
    isLoading: false,
    error: "",
  })

  const {
    activityType,
    questions,
    answers,
    hasMoreQuestions,
    hasMoreAnswers,
    isLoading,
    error,
  } = state

  const isQuestionActivity = activityType === "questions"
  const currentItems = isQuestionActivity ? questions : answers
  const currentTotal = isQuestionActivity ? totalQuestions : totalAnswers
  const hasMore = isQuestionActivity ? hasMoreQuestions : hasMoreAnswers
  const currentCount = currentItems.length

  const handleTabChange = (nextActivityType: ActivityType) => {
    dispatch({ type: "select", activityType: nextActivityType })
  }

  const loadMore = async () => {
    dispatch({ type: "request-start" })

    try {
      const result = await getUserActivity({
        userId,
        type: activityType,
        page: getNextPageNumber(currentCount),
        pageSize: PAGE_SIZE,
      })

      if (!result.success || !result.data) {
        dispatch({
          type: "request-error",
          error: result.error?.message ?? "Failed to load more activity.",
        })
        return
      }

      dispatch({
        type: "activity-loaded",
        activityType,
        questions: result.data.questions,
        answers: result.data.answers,
        isNext: result.data.isNext,
      })
    } catch (loadError) {
      dispatch({
        type: "request-error",
        error: getErrorMessage(
          loadError,
          "Failed to load more activity. Please try again."
        ),
      })
    } finally {
      dispatch({ type: "request-end" })
    }
  }

  const removeQuestion = async (questionId: string) => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return
    }

    dispatch({ type: "request-start" })

    try {
      const result = await deleteQuestion({ questionId })

      if (!result.success) {
        dispatch({
          type: "request-error",
          error: result.error?.message ?? "Failed to delete this post.",
        })
        return
      }

      router.refresh()
    } catch (deleteError) {
      dispatch({
        type: "request-error",
        error: getErrorMessage(
          deleteError,
          "Failed to delete this post. Please try again."
        ),
      })
    } finally {
      dispatch({ type: "request-end" })
    }
  }

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
        />

        <ProfileActivityError error={error} />

        <ProfileActivityLoadMore
          hasMore={hasMore}
          isLoading={isLoading}
          onLoadMore={loadMore}
        />

        <span className="sr-only" aria-live="polite">
          Showing {currentCount} of {currentTotal}{" "}
          {isQuestionActivity ? "posts" : "answers"}
        </span>
      </section>
    </div>
  )
}

export default ProfileActivity
