"use client"

import { useRouter, useSearchParams } from "next/navigation"


interface JobCategoryFiltersProps {
  categories: string[]
}

const JobCategoryFilters = ({ categories }: JobCategoryFiltersProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeCategory = searchParams.get("category") || "all"

  const updateCategory = (category: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("page")

    if (category === "all") params.delete("category")
    else params.set("category", category)

    const query = params.toString()
    router.push(query ? `/jobs?${query}` : "/jobs", { scroll: false })
  }

  const filters = [
    ...categories.map((category) => ({
      label: category.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase()),
      value: category,
    })),
  ]

  return (
    <div className="mt-6 flex flex-wrap gap-2" aria-label="Filter jobs by category">
      {filters.map(({ label, value }) => {
        const isActive = activeCategory.toLowerCase() === value.toLowerCase()

        return (
          <button
            key={value}
            type="button"
            aria-pressed={isActive}
            onClick={() => updateCategory(value)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "border-primary-500 bg-primary-100 text-primary-500 dark:bg-primary-500/15"
                : "light-border text-dark400_light700 hover:border-primary-500/50 hover:text-primary-500"
            }`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

export default JobCategoryFilters
