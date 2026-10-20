"use client"

import AppError from "@/shared/components/common/AppError"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body>
        <AppError error={error} reset={reset} />
      </body>
    </html>
  )
}
