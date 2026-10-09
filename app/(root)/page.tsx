import { Metadata } from "next"
import Link from "next/link"

import { QuestionCard } from "@/components/cards"
import CommonFilter from "@/components/filters/CommonFilters"
import HomeFilters from "@/components/filters/HomeFilters"
import { Pagination } from "@/components/navigation"
import LocalSearchBar from "@/components/search/LocalSearchBar"
import { DataRender } from "@/components/shared"
import { Button } from "@/components/ui"
import { homeFilters } from "@/constants/filter"
import ROUTES from "@/constants/route"
import { EMPTY_QUESTION } from "@/constants/states"
import { getQuestions } from "@/lib/actions"
import { RouteParams } from "@/types"

export const metadata: Metadata = {
  title: "Dev Overflow | Home",
  description:
    "Discover different programming questions and answers with recommendations from the community."
}

async function Home({ searchParams }: RouteParams) {
  const resolvedSearchParams = await searchParams

  const {
    page,
    pageSize,
    query,
    filter
  } = resolvedSearchParams || {}

  const normalizedQuery = Array.isArray(query)
    ? query[0]
    : query

  const normalizedFilter = Array.isArray(filter)
    ? filter[0]
    : filter

  const { success, data, error } = await getQuestions({
    page: Number(page)|| 1,
    pageSize: Number(pageSize)|| 10,
    query: normalizedQuery,
    filter: normalizedFilter
  })

  const { questions,isNext } = data || {}

  return (
    <>
      <section className="flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="h1-bold text-dark100_light900">
          All Questions
        </h1>

        <Button
          className="primary-gradient min-h-11.5 px-4 py-3 text-light-900!"
          asChild
        >
          <Link
            href={ROUTES.ASK_QUESTION}
            className="max-sm:w-full"
          >
            Ask a Question
          </Link>
        </Button>
      </section>

      <section className="mt-11 w-full">
        <LocalSearchBar
          route={ROUTES.HOME}
          imgSrc="/icons/search.svg"
          placeholder="Search questions..."
          otherClasses="w-full flex-1"
        />
        <div className="hidden sm:block">
          <HomeFilters />
        </div>
        <div className="sm:hidden">
          <CommonFilter
            filters={homeFilters}
            defaultValue="newest"
            showFilterIcon
            otherClasses="min-h-12 w-full"
            containerClasses="mt-6"
          />
        </div>
      </section>

      <DataRender
        success={success}
        error={error}
        data={questions}
        empty={EMPTY_QUESTION}
        render={(questions) => (
          <div className="mt-10 flex w-full flex-col gap-6">
            {questions.map((question) => (
              <QuestionCard
                key={question._id}
                question={question}
              />
            ))}
          </div>
        )}
      />
      <Pagination pageNumber={Number(page) || 1} isNext={isNext || false} />
    </>
  )
}

export default Home
