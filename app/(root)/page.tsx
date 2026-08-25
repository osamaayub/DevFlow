import Link from "next/link"

import QuestionCard from "@/components/cards/QuestionCard"
import HomeFilters from "@/components/filters/HomeFilters"
import LocalSearchBar from "@/components/search/LocalSearchBar"
import { Button } from "@/components/ui/button"
import Routes from "@/constants/route"
import { getQuestions } from "@/lib/actions"

interface SearchParams {
  searchParams: Promise<{
    query?: string
    filter?: string
    page?: string
    pageSize?: string
  }>
}

const Home = async ({ searchParams }: SearchParams) => {
  const { query = "", filter = "", page = "1", pageSize = "10" } = await searchParams

  const response = await getQuestions({
    query: query || undefined,
    filter: filter || undefined,
    page: Number(page),
    pageSize: Number(pageSize),
  })

  if (!response.success) {
    return (
      <section className="w-full">
        <h1 className="h1-bold text-dark100_light900">Error loading questions</h1>
        <p className="text-red-500 mt-4">
          {response.error?.message || "Failed to fetch questions"}
        </p>
      </section>
    )
  }

  const { questions, isNext } = response.data || { questions: [], isNext: false }

  return (
    <>
      <section className="w-full flex flex-col-reverse sm:flex-row justify-between gap-4 sm:items-center">
        <h1 className="h1-bold text-dark100_light900">All Questions</h1>
        <Button className="primary-gradient text-light-900! min-h-11.5 px-4 py-3" asChild>
          <Link href={Routes.ASK_QUESTION}>Ask a Question</Link>
        </Button>
      </section>
      <section className="mt-11">
        <LocalSearchBar
          route="/"
          imgSrc={"/icons/search.svg"}
          placeholder="Search Questions..."
          otherClasses="flex-1 "
        />
      </section>
      <section className="mt-11">
        <HomeFilters />
        <div className="mt-10 flex w-full flex-col gap-6">
          {questions.length > 0 ? (
            questions.map((question) => (
              <QuestionCard key={question._id} question={question} />
            ))
          ) : (
            <div className="text-center py-10">
              <p className="text-dark200_light800 text-lg">
                No questions found. Try adjusting your search!
              </p>
            </div>
          )}
        </div>

        {isNext && (
          <div className="mt-10 flex justify-center">
            <Button asChild className="primary-gradient">
              <Link href={`/?page=${Number(page) + 1}&filter=${filter}&query=${query}`}>
                Load More
              </Link>
            </Button>
          </div>
        )}
      </section>
    </>
  )
}

export default Home