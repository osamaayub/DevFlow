import { Metadata } from "next"
import Link from "next/link"

import { QuestionCard } from "@/components/cards"
import HomeFilters from "@/components/filters/HomeFilters"
import LocalSearchBar from "@/components/search/LocalSearchBar"
import { DataRender } from "@/components/shared"
import { Button } from "@/components/ui"
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
    page = "1",
    pageSize = "10",
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
    page: Number(page),
    pageSize: Number(pageSize),
    query: normalizedQuery,
    filter: normalizedFilter
  })

  const { questions } = data || {}

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
        <HomeFilters />
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
    </>
  )
}

export default Home
