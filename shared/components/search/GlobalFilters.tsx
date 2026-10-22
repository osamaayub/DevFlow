"use client"

import { useRouter, useSearchParams } from "next/navigation"

import { GlobalSearchFilters } from "@/shared/constants/filter"
import { formUrlQuery, removeKeysFromUrlQuery } from "@/shared/lib/url"

export const GlobalFilters = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const active = searchParams.get("type") || ""

  const handleTypeClick = (item: string) => {
    const itemLower = item.toLowerCase()
    if (active.toLowerCase() === itemLower) {
      const newUrl = removeKeysFromUrlQuery({
        params: searchParams.toString(),
        keysToRemove: ["type"],
      })
      router.push(newUrl, { scroll: false })
    } else {
      const newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: "type",
        value: itemLower,
      })
      router.push(newUrl, { scroll: false })
    }
  }

  return (
    <div className="flex items-center gap-5 px-5">
      <p className="text-dark400_light900 body-medium">Type: </p>
      <div className="flex flex-wrap gap-3">
        {GlobalSearchFilters.map((item) => (
          <button
            type="button"
            key={item.value}
            onClick={() => handleTypeClick(item.value)}
            className={`light-border-2 small-medium rounded-2xl px-5 py-2 capitalize transition-colors dark:text-light-800 ${
              active.toLowerCase() === item.value.toLowerCase()
                ? "bg-primary-500 text-light-900 dark:text-light-900"
                : "bg-light-700 text-dark-400 hover:text-primary-500 dark:bg-dark-500"
            }`}
          >
            {item.name}
          </button>
        ))}
      </div>
    </div>
  )
}

export default GlobalFilters
