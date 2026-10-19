"use client"

import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { deleteAnswer } from "@/features/answers/actions"
import { deleteQuestion } from "@/features/questions/actions"
import {
  getUserAnswersActivity,
  getUserQuestionsActivity,
} from "@/features/users/actions"
import { QUESTIONS_PER_PAGE } from "@/shared/constants/pagination"

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

// Must match the 3 items getUser renders first, so page 2 starts right after them
const PAGE_SIZE = QUESTIONS_PER_PAGE

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback

const mergeRefreshedItems = <T extends { _id: string }>(
  currentItems: T[],
  refreshedItems: T[]
) => {
  const refreshedById = new Map(
    refreshedItems.map((item) => [item._id, item])
  )

  return currentItems.map((item) => refreshedById.get(item._id) ?? item)
}

export const useProfileActivity = ({
  userId,
  topQuestions,
  topAnswers,
  hasMoreQuestions,
  hasMoreAnswers,
}: UseProfileActivityOptions) => {
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
  const currentUserId = useRef(userId)

  useEffect(() => {
    activityDataVersion.current += 1
    const isDifferentUser = currentUserId.current !== userId
    currentUserId.current = userId

    setState((currentState) => ({
      ...currentState,
      activityType: isDifferentUser ? "questions" : currentState.activityType,
      pages: isDifferentUser
        ? { questions: 1, answers: 1 }
        : currentState.pages,
      questions:
        isDifferentUser || currentState.pages.questions === 1
          ? topQuestions
          : mergeRefreshedItems(currentState.questions, topQuestions),
      answers:
        isDifferentUser || currentState.pages.answers === 1
          ? topAnswers
          : mergeRefreshedItems(currentState.answers, topAnswers),
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
      if (activityType === "questions") {
        const result = await getUserQuestionsActivity({
          userId,
          page: nextPage,
          pageSize: PAGE_SIZE,
        })

        if (requestDataVersion !== activityDataVersion.current) {
          return
        }

        if (!result.success || !result.data) {
          setActivityError(
            activityType,
            result.error?.message ?? "Failed to load questions."
          )
          return
        }

        const { data } = result
        setState((currentState) => ({
          ...currentState,
          questions: data.questions,
          pages: { ...currentState.pages, questions: nextPage },
          hasMore: { ...currentState.hasMore, questions: data.isNext },
        }))
      } else {
        const result = await getUserAnswersActivity({
          userId,
          page: nextPage,
          pageSize: PAGE_SIZE,
        })

        if (requestDataVersion !== activityDataVersion.current) {
          return
        }

        if (!result.success || !result.data) {
          setActivityError(
            activityType,
            result.error?.message ?? "Failed to load answers."
          )
          return
        }

        const { data } = result
        setState((currentState) => ({
          ...currentState,
          answers: data.answers,
          pages: { ...currentState.pages, answers: nextPage },
          hasMore: { ...currentState.hasMore, answers: data.isNext },
        }))
      }
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

  /** Deletes a question after the user confirms it. Resolves to true on success. */
  const removeQuestion = async (questionId: string): Promise<boolean> => {
    if (!beginRequest()) {
      return false
    }

    try {
      const result = await deleteQuestion({ questionId })

      if (!result.success) {
        toast.error(result.error?.message ?? "Failed to delete this question.")
        return false
      }

      toast.success("Question deleted successfully.")
      setState((currentState) => ({
        ...currentState,
        questions: currentState.questions.filter(
          (question) => question._id !== questionId
        ),
      }))
      // deleteQuestion revalidates this profile, which re-renders it in the same response
      return true
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Failed to delete this question. Please try again.")
      )
      return false
    } finally {
      endRequest()
    }
  }

  /** Deletes an answer after the user confirms it. Resolves to true on success. */
  const removeAnswer = async (answerId: string): Promise<boolean> => {
    if (!beginRequest()) {
      return false
    }

    try {
      const result = await deleteAnswer({ answerId })

      if (!result.success) {
        toast.error(result.error?.message ?? "Failed to delete this answer.")
        return false
      }

      toast.success("Answer deleted successfully.")
      setState((currentState) => ({
        ...currentState,
        answers: currentState.answers.filter((answer) => answer._id !== answerId),
      }))
      // deleteAnswer revalidates this profile, which re-renders it in the same response
      return true
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete this answer. Please try again."))
      return false
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
    removeAnswer,
  }
}
