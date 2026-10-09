"use client"

import { useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui"
import { formUrlQuery } from "@/lib"

interface Props {
  pageNumber: number
  isNext: boolean
  containerClasses?: string
}

export function Pagination({ pageNumber, isNext, containerClasses }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleNavigation = (direction: "prev" | "next") => {
    const nextPage = direction === "prev" ? pageNumber - 1 : pageNumber + 1

    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: "page",
      value: nextPage.toString(),
    })

    router.push(newUrl, { scroll: false })
  }

  return (
    <nav
      aria-label="Pagination"
      className={`mt-8 mb-10 flex w-full items-center justify-center gap-3 ${containerClasses || ""}`}
    >
      <Button
        disabled={pageNumber <= 1}
        onClick={() => handleNavigation("prev")}
        className="light-border-2 btn min-h-10 w-20 border px-4 text-dark200_light800"
      >
        Prev
      </Button>
      
      <div
        aria-current="page"
        aria-label={`Page ${pageNumber}`}
        className="flex size-10 items-center justify-center rounded-md bg-primary-500"
      >
        <p className="body-semibold text-light-900">{pageNumber}</p>
      </div>

      <Button
        disabled={!isNext}
        onClick={() => handleNavigation("next")}
        className="light-border-2 btn min-h-10 w-20 border px-4 text-dark200_light800"
      >
        Next
      </Button>
    </nav>
  )
}