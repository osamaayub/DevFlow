"use client"

import { ChevronDown } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { communityFilters } from "@/constants/filter"
import { formUrlQuery, removeKeysFromUrlQuery } from "@/lib"
import { cn } from "@/lib/utils"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui"

const CommunityFilterDropdown = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const filterParams = searchParams.get("filter")
  const searchParamsString = searchParams.toString()
  const [active, setActive] = useState("")

  useEffect(() => {
    setActive(filterParams || "")
  }, [filterParams])

  const handleTypeClick = (filter: string) => {
    let newUrl = ""
    const currentUrl = typeof window !== "undefined"
      ? `${window.location.pathname}${window.location.search}`
      : ""

    if (filter === active) {
      setActive("")
      newUrl = removeKeysFromUrlQuery({
        params: searchParamsString,
        keysToRemove: ["filter"],
      })
    } else {
      setActive(filter)
      newUrl = formUrlQuery({
        params: searchParamsString,
        key: "filter",
        value: filter.toLowerCase(),
      })
    }

    if (newUrl !== currentUrl) {
      router.replace(newUrl, { scroll: false })
    }
  }

  const getActiveFilterName = () => {
    const activeFilter = communityFilters.find((filter) => filter.value === active)
    return activeFilter ? activeFilter.name : "Highest Reputation"
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-2 rounded-lg border border-light-700 bg-light-800 px-4 py-2.5 text-sm text-light-500 transition-colors hover:bg-light-700 dark:border-dark-400 dark:bg-dark-300 dark:text-light-500 dark:hover:bg-dark-400"
          )}
        >
          <span>{getActiveFilterName()}</span>
          <ChevronDown className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {communityFilters.map((filter) => (
          <DropdownMenuItem
            key={filter.name}
            onClick={() => handleTypeClick(filter.value)}
            className={cn(
              "cursor-pointer",
              active === filter.value
                ? "bg-primary-100 text-primary-500 dark:bg-dark-400 dark:text-primary-500"
                : "text-dark400_light700"
            )}
          >
            {filter.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default CommunityFilterDropdown
