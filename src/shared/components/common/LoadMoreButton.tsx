"use client"

import { LoaderIcon } from "lucide-react"

import { Button } from "@/shared/components/ui"

interface LoadMoreButtonProps {
  hasMore: boolean
  isLoading: boolean
  onLoadMore: () => void
  error?: string
  label?: string
}

/** Shown under a list while more items exist. Renders nothing once everything is loaded. */
const LoadMoreButton = ({
  hasMore,
  isLoading,
  onLoadMore,
  error,
  label = "Load more",
}: LoadMoreButtonProps) => {
  if (!hasMore) return null

  return (
    <div className="mt-8 mb-10 flex flex-col items-center gap-3">
      {error && (
        <p role="alert" className="body-regular text-red-500">
          {error}
        </p>
      )}
      <Button
        type="button"
        onClick={onLoadMore}
        disabled={isLoading}
        aria-busy={isLoading}
        className="primary-gradient min-h-11 min-w-36 px-6 font-semibold !text-light-900"
      >
        {isLoading ? (
          <>
            <LoaderIcon className="size-4 animate-spin" aria-hidden="true" />
            Loading…
          </>
        ) : (
          label
        )}
      </Button>
    </div>
  )
}

export default LoadMoreButton
