"use client"

import { useCallback, useEffect, useRef } from "react"
import { toast } from "sonner"

import { incrementQuestionViews } from "@/lib/actions"
import type { IncrementQuestionViewsParams } from "@/types/action"

type ViewProps = IncrementQuestionViewsParams

const View = ({ questionId }: ViewProps) => {
  const hasIncremented = useRef(false)

  const handleIncrementViews = useCallback(async () => {
    if (hasIncremented.current) return
    hasIncremented.current = true

    try {
      const result = await incrementQuestionViews({ questionId })

      if (!result?.success) {
        toast.error(result?.error?.message || "Failed to increment question views")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to increment question views")
    }
  }, [questionId])

  useEffect(() => {
    handleIncrementViews()
  }, [handleIncrementViews])

  return null 
}

export default View
