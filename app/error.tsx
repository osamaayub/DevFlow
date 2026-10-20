"use client"

import AppError from "@/shared/components/common/AppError"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <AppError error={error} reset={reset} />
}
