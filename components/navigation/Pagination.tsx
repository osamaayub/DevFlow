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

  if (pageNumber <= 1 && !isNext) return null

  return (
    <div className={`flex w-full items-center justify-center gap-2 ${containerClasses || ""}`}>
      <Button
        disabled={pageNumber <= 1}
        onClick={() => handleNavigation("prev")}
        className="light-border-2 btn border text-dark200_light800 min-h-[36px] px-4"
      >
        Prev
      </Button>
      
      <div className="flex items-center justify-center bg-primary-500 px-3.5 py-2 rounded-md">
        <p className="body-semibold text-light-900">{pageNumber}</p>
      </div>

      <Button
        disabled={!isNext}
        onClick={() => handleNavigation("next")}
        className="light-border-2 btn border text-dark200_light800 min-h-[36px] px-4"
      >
        Next
      </Button>
    </div>
  )
}