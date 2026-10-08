"use client"

import { useRouter, useSearchParams } from "next/navigation"

import { formUrlQuery, removeKeysFromUrlQuery } from "@/lib"
import { cn } from "@/lib/utils"

import { Button } from "../ui"

interface Filter {
  name: string
  value: string
}

interface Props {
  filters: Filter[]
  paramKey?: string
  defaultValue?: string
  otherClasses?: string
}

const FilterButtons = ({
  filters,
  paramKey = "filter",
  defaultValue,
  otherClasses = "",
}: Props) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeFilter = searchParams.get(paramKey) || defaultValue
  const availableFilters = filters.some((filter) => filter.value === "all")
    ? filters
    : [{ name: "All", value: "all" }, ...filters]

  const handleFilterClick = (value: string) => {
    const params = searchParams.toString()
    const newUrl =
      value === "all"
        ? removeKeysFromUrlQuery({ params, keysToRemove: [paramKey] })
        : formUrlQuery({ params, key: paramKey, value })

    router.replace(newUrl, { scroll: false })
  }

  return (
    <div className={cn("flex flex-nowrap gap-3", otherClasses)}>
      {availableFilters.map((filter) => (
        <Button
          key={filter.value}
          onClick={() => handleFilterClick(filter.value)}
          className={cn(
            "body-medium h-12 rounded-lg px-5 py-2.5 capitalize shadow-none",
            activeFilter === filter.value
              ? "bg-primary-100 text-primary-500 hover:bg-primary-100 dark:bg-dark-400 dark:text-primary-500 dark:hover:bg-dark-400"
              : "bg-light-800 text-light-500 hover:bg-light-800 dark:bg-dark-300 dark:text-light-500"
          )}
          aria-pressed={activeFilter === filter.value}
        >
          {filter.name}
        </Button>
      ))}
    </div>
  )
}

export default FilterButtons
