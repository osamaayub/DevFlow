"use client"

import { useRouter } from "next/navigation"
import { useReducer } from "react"

import { deleteQuestion } from "@/features/questions/actions"
import { getUserActivity } from "@/features/users/actions"
import { Button } from "@/shared/components/ui"

import {
  ProfileAnswerCard,
  ProfileQuestionCard,
} from "./ProfileActivityCards"
import type { TopAnswer, TopQuestion } from "./ProfileActivityCards"

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

type ActivityType = "questions" | "answers"

const PAGE_SIZE = 3
const ACTIVITY_TABS: Array<{ type: ActivityType; label: string }> = [
  { type: "questions", label: "Top Posts" },
  { type: "answers", label: "Answers" },
]

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
    case "activity-loaded":
      return action.activityType === "questions"
        ? {
            ...state,
            questions: [...state.questions, ...action.questions],
            hasMoreQuestions: action.isNext,
          }
        : {
            ...state,
            answers: [...state.answers, ...action.answers],
            hasMoreAnswers: action.isNext,
          }
  }
}

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback

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

  const loadMore = async () => {
    dispatch({ type: "request-start" })

    try {
      const result = await getUserActivity({
        userId,
        type: activityType,
        page: Math.floor(currentCount / PAGE_SIZE) + 1,
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
    if (!window.confirm("Are you sure you want to delete this post?")) return

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
        <div
          aria-label="Profile activity"
          className="mb-5 flex w-full max-w-sm items-center gap-1 rounded-lg bg-light-800 p-1 dark:bg-dark-300"
        >
          {ACTIVITY_TABS.map(({ type, label }) => {
            const isActive = activityType === type

            return (
              <button
                key={type}
                type="button"
                aria-pressed={isActive}
                onClick={() => dispatch({ type: "select", activityType: type })}
                className={`min-h-10 flex-1 rounded-md px-4 py-2 text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500 ${
                  isActive
                    ? "bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-300"
                    : "bg-light-800 text-dark400_light700 dark:bg-dark-300"
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>

        <div className="flex flex-col gap-4">
          {isQuestionActivity
            ? questions.map((question) => (
                <ProfileQuestionCard
                  key={question._id}
                  question={question}
                  userId={userId}
                  userName={userName}
                  userImage={userImage}
                  isOwnProfile={isOwnProfile}
                  isLoading={isLoading}
                  onDelete={removeQuestion}
                />
              ))
            : answers.map((answer) => (
                <ProfileAnswerCard
                  key={answer._id}
                  answer={answer}
                  userId={userId}
                  userName={userName}
                  userImage={userImage}
                />
              ))}

          {currentCount === 0 && (
            <p className="body-regular py-6 text-dark400_light700">
              {isQuestionActivity ? "No posts yet." : "No answers yet."}
            </p>
          )}
        </div>

        {error && (
          <p role="alert" className="body-regular mt-4 text-red-500">
            {error}
          </p>
        )}

        {hasMore && (
          <div className="mt-5 flex justify-center">
            <Button
              type="button"
              onClick={loadMore}
              disabled={isLoading}
              className="primary-gradient min-h-10 min-w-28 px-5 py-2 text-sm text-light-900"
            >
              {isLoading ? "Loading..." : "Load More"}
            </Button>
          </div>
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
