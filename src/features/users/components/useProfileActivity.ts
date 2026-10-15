"use client"

import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { deleteQuestion } from "@/features/questions/actions"
import { getUserActivity } from "@/features/users/actions"

import type { ActivityType } from "./ProfileActivity.types"
import type { TopAnswer, TopQuestion } from "./ProfileActivityCards"

interface UseProfileActivityOptions {
  userId: string
  topQuestions: TopQuestion[]
  topAnswers: TopAnswer[]
  hasMoreQuestions: boolean
  hasMoreAnswers: boolean
}

interface ActivityState {
  activityType: ActivityType
  pages: Record<ActivityType, number>
  questions: TopQuestion[]
  answers: TopAnswer[]
  hasMore: Record<ActivityType, boolean>
  isLoading: boolean
  error: string
}

const PAGE_SIZE = 10

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback

export const useProfileActivity = ({
  userId,
  topQuestions,
  topAnswers,
  hasMoreQuestions,
  hasMoreAnswers,
}: UseProfileActivityOptions) => {
  const router = useRouter()
  const [state, setState] = useState<ActivityState>({
    activityType: "questions",
    pages: { questions: 1, answers: 1 },
    questions: topQuestions,
    answers: topAnswers,
    hasMore: {
      questions: hasMoreQuestions,
      answers: hasMoreAnswers,
    },
    isLoading: false,
    error: "",
  })
  const requestInProgress = useRef(false)
  const activityDataVersion = useRef(0)

  useEffect(() => {
    activityDataVersion.current += 1
    setState((currentState) => ({
      ...currentState,
      pages: { questions: 1, answers: 1 },
      questions: topQuestions,
      answers: topAnswers,
      hasMore: {
        questions: hasMoreQuestions,
        answers: hasMoreAnswers,
      },
      error: "",
    }))
  }, [userId, topQuestions, topAnswers, hasMoreQuestions, hasMoreAnswers])

  const beginRequest = () => {
    if (requestInProgress.current) {
      return false
    }

    requestInProgress.current = true
    setState((currentState) => ({
      ...currentState,
      isLoading: true,
      error: "",
    }))
    return true
  }

  const endRequest = () => {
    requestInProgress.current = false
    setState((currentState) => ({ ...currentState, isLoading: false }))
  }

  const setActivityError = (activityType: ActivityType, message: string) => {
    setState((currentState) =>
      currentState.activityType === activityType
        ? { ...currentState, error: message }
        : currentState
    )
  }

  const handleTabChange = (activityType: ActivityType) => {
    setState((currentState) => ({
      ...currentState,
      activityType,
      error: "",
    }))
  }

  const handlePageChange = async (direction: "prev" | "next") => {
    const { activityType } = state
    const page = state.pages[activityType]
    const nextPage = direction === "prev" ? page - 1 : page + 1

    if (
      nextPage < 1 ||
      (direction === "next" && !state.hasMore[activityType]) ||
      !beginRequest()
    ) {
      return
    }

    const requestDataVersion = activityDataVersion.current

    try {
      const result = await getUserActivity({
        userId,
        type: activityType,
        page: nextPage,
        pageSize: PAGE_SIZE,
      })

      if (requestDataVersion !== activityDataVersion.current) {
        return
      }

      if (!result.success || !result.data) {
        setActivityError(
          activityType,
          result.error?.message ?? "Failed to load activity."
        )
        return
      }

      const { data } = result

      setState((currentState) => ({
        ...currentState,
        ...(activityType === "questions"
          ? {
              questions: data.questions,
            }
          : {
              answers: data.answers,
            }),
        pages: { ...currentState.pages, [activityType]: nextPage },
        hasMore: { ...currentState.hasMore, [activityType]: data.isNext },
      }))
    } catch (error) {
      if (requestDataVersion === activityDataVersion.current) {
        setActivityError(
          activityType,
          getErrorMessage(error, "Failed to load activity. Please try again.")
        )
      }
    } finally {
      endRequest()
    }
  }

  const removeQuestion = async (questionId: string) => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return
    }

    if (!beginRequest()) {
      return
    }

    try {
      const result = await deleteQuestion({ questionId })

      if (!result.success) {
        const message = result.error?.message ?? "Failed to delete this post."
        setActivityError("questions", message)
        toast.error(message)
        return
      }

      toast.success("Question deleted successfully.")
      setState((currentState) => ({
        ...currentState,
        questions: currentState.questions.filter(
          (question) => question._id !== questionId
        ),
      }))
      router.refresh()
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Failed to delete this post. Please try again."
      )
      setActivityError("questions", message)
      toast.error(message)
    } finally {
      endRequest()
    }
  }

  return {
    ...state,
    page: state.pages[state.activityType],
    hasMoreQuestions: state.hasMore.questions,
    hasMoreAnswers: state.hasMore.answers,
    handleTabChange,
    handlePageChange,
    removeQuestion,
  }
}
