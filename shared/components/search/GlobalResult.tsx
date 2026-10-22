"use client"

import { AlertCircle, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

import { globalSearch } from "@/features/search/actions"
import { GlobalSearchedItem } from "@/shared/types"

import { GlobalFilters } from "./GlobalFilters"

interface Props {
  onSelect?: () => void
}

const MAX_CACHE_SIZE = 100
const searchCache = new Map<string, GlobalSearchedItem[]>()

const getCacheKey = (query: string, type: string | null) =>
  `${type?.toLowerCase() || "all"}:${query.toLowerCase().trim()}`

export const GlobalResult = ({ onSelect }: Props) => {
  const searchParams = useSearchParams()

  const global = searchParams.get("global")?.trim() || ""
  const type = searchParams.get("type")
  const cacheKey = global ? getCacheKey(global, type) : ""

  const cachedData = cacheKey ? searchCache.get(cacheKey) : undefined

  const [isLoading, setIsLoading] = useState(!cachedData && Boolean(global))
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<GlobalSearchedItem[]>(cachedData || [])
  const [prevCacheKey, setPrevCacheKey] = useState(cacheKey)

  // Synchronize state during render on cache-hit or query change (zero-delay instant feedback)
  if (cacheKey !== prevCacheKey) {
    setPrevCacheKey(cacheKey)
    if (!global) {
      setResult([])
      setIsLoading(false)
      setError(null)
    } else if (cachedData) {
      setResult(cachedData)
      setIsLoading(false)
      setError(null)
    } else {
      setResult([])
      setIsLoading(true)
      setError(null)
    }
  }

  useEffect(() => {
    if (!global) return

    const key = getCacheKey(global, type)
    if (searchCache.has(key)) return

    let isCurrent = true

    const fetchResult = async () => {
      try {
        const res = await globalSearch({ query: global, type })
        if (!isCurrent) return

        if (res?.success && res.data) {
          if (searchCache.size >= MAX_CACHE_SIZE) {
            const firstKey = searchCache.keys().next().value
            if (firstKey) searchCache.delete(firstKey)
          }
          searchCache.set(key, res.data)
          setResult(res.data)
          setError(null)
        } else {
          setError(res?.error?.message || "Failed to fetch search results")
          setResult([])
        }
      } catch (err) {
        if (!isCurrent) return
        console.error("Global search error:", err)
        setError("An unexpected error occurred while searching")
        setResult([])
      } finally {
        if (isCurrent) {
          setIsLoading(false)
        }
      }
    }

    fetchResult()

    return () => {
      isCurrent = false
    }
  }, [global, type])

  const renderLink = (itemType: string, id: string) => {
    switch (itemType) {
      case "question":
      case "answer":
        return `/questions/${id}`
      case "user":
        return `/profile/${id}`
      case "tag":
        return `/tags/${id}`
      default:
        return "/"
    }
  }

  const getIconForType = (itemType: string) => {
    switch (itemType) {
      case "question":
        return "/icons/question.svg"
      case "answer":
        return "/icons/message.svg"
      case "user":
        return "/icons/user.svg"
      case "tag":
        return "/icons/tag.svg"
      default:
        return "/icons/tag.svg"
    }
  }

  return (
    <div className="absolute top-full z-10 mt-3 w-full rounded-[10px] bg-light-800 py-5 shadow-sm dark:bg-dark-400">
      <GlobalFilters />
      <div className="my-5 h-[1px] bg-light-700/50 dark:bg-dark-500/50" />

      <div className="space-y-5">
        <p className="text-dark400_light900 paragraph-semibold px-5">Top Match</p>

        {isLoading ? (
          <div className="flex-center flex-col px-5 py-2.5">
            <Loader2 className="my-2 size-10 animate-spin text-primary-500" />
            <p className="body-regular text-dark200_light800">
              Browsing the entire database...
            </p>
          </div>
        ) : error ? (
          <div className="flex-center flex-col gap-2 px-5 py-2.5 text-center">
            <AlertCircle className="size-8 text-red-500" />
            <p className="body-regular text-red-500">{error}</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {result.length > 0 ? (
              result.map((item: GlobalSearchedItem, index: number) => (
                <Link
                  href={renderLink(item.type, item.id)}
                  key={`${item.type}-${item.id}-${index}`}
                  onClick={onSelect}
                  className="flex w-full cursor-pointer items-start gap-3 px-5 py-2.5 hover:bg-light-700/50 dark:hover:bg-dark-500/50"
                >
                  <Image
                    src={getIconForType(item.type)}
                    alt={item.type}
                    width={18}
                    height={18}
                    className="invert-colors mt-1 object-contain"
                  />
                  <div className="flex flex-col">
                    <p className="body-medium text-dark200_light800 line-clamp-1">
                      {item.title}
                    </p>
                    <p className="small-medium text-light400_light500 mt-1 font-bold capitalize">
                      {item.type}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="flex-center flex-col px-5">
                <p className="text-dark200_light800 body-regular px-5 py-2.5">
                  Oops, no results found
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default GlobalResult
