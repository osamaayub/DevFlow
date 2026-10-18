"use client"

import { useState, useTransition } from "react"

export interface LoadMorePage<T> {
  items: T[]
  hasMore: boolean
}

interface UseLoadMoreOptions<T> {
  initialItems: T[]
  initialHasMore: boolean
  /** Page number the server rendered (usually 1) */
  initialPage?: number
  /** Loads one page. Throw to show an error; the current items stay on screen. */
  loadPage: (page: number) => Promise<LoadMorePage<T>>
}

/**
 * Appends the next page of a server-rendered list. The first page comes from the server;
 * each loadMore() fetches one more page and appends it, skipping items already shown
 * (a new post can shift offsets between requests). Give the component using this hook a
 * `key` built from its filters, so changing a filter starts the list over.
 */
export function useLoadMore<T extends { _id: string }>({
  initialItems,
  initialHasMore,
  initialPage = 1,
  loadPage,
}: UseLoadMoreOptions<T>) {
  const [items, setItems] = useState(initialItems)
  const [page, setPage] = useState(initialPage)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [error, setError] = useState("")
  const [isLoading, startTransition] = useTransition()

  const loadMore = () => {
    if (isLoading || !hasMore) return

    startTransition(async () => {
      try {
        const nextPage = page + 1
        const result = await loadPage(nextPage)

        setItems((current) => {
          const shown = new Set(current.map((item) => item._id))
          return [...current, ...result.items.filter((item) => !shown.has(item._id))]
        })
        setPage(nextPage)
        setHasMore(result.hasMore)
        setError("")
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Couldn't load more. Please try again.")
      }
    })
  }

  return { items, hasMore, isLoading, error, loadMore }
}
