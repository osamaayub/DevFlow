import { redirect } from "next/navigation"

import { auth } from "@/auth" 
import { QuestionCard } from "@/components/cards"
import CommonFilter from "@/components/filters/CommonFilters"
import FilterButtons from "@/components/filters/FilterButtons"
import { Pagination } from "@/components/navigation"
import LocalSearchBar from "@/components/search/LocalSearchBar"
import { DataRender } from "@/components/shared"
import ROUTES from "@/constants/route"
import { EMPTY_COLLECTIONS } from "@/constants/states"
import { getSaveQuestions } from "@/lib/actions"
import { Question as QuestionType, RouteParams } from "@/types"

const collectionSortFilters = [
  { name: "Newest", value: "newest" },
  { name: "Most Popular", value: "popular" },
  { name: "Unanswered", value: "unanswered" },
]

const CollectionPage = async ({ searchParams }: RouteParams) => {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    redirect(ROUTES.SIGN_IN)
  }

  const { page, pageSize, query, filter, tag } = (await searchParams) || {}
  const pageNumber = Number(page) || 1

  const { success, data, error } = await getSaveQuestions({
    page: pageNumber,
    pageSize: Number(pageSize) || 10,
    query: typeof query === "string" ? query : "",
    filter: typeof filter === "string" ? filter : "",
    tag: typeof tag === "string" ? tag : "",
  })

  const { questions, isNext, tags } = data || {}

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Saved Questions</h1>
      <section className="mt-8 w-full">
        <LocalSearchBar
          route={ROUTES.COLLECTION}
          imgSrc="/icons/search.svg"
          placeholder="Search Saved Questions..."
          otherClasses="w-full !min-h-12"
        />
        <div className="mt-4 hidden flex-wrap items-center justify-between gap-4 sm:flex">
          <CommonFilter
            paramKey="tag"
            filters={[
              { name: "All tags", value: "all" },
              ...(tags || []).map((name) => ({ name, value: name })),
            ]}
            showFilterIcon
            otherClasses="min-h-12 min-w-[170px]"
          />
          <FilterButtons
            filters={collectionSortFilters}
            defaultValue="newest"
          />
        </div>
        <div className="mt-4 flex flex-wrap justify-end gap-3 sm:hidden">
          <CommonFilter
            paramKey="tag"
            filters={[
              { name: "All tags", value: "all" },
              ...(tags || []).map((name) => ({ name, value: name })),
            ]}
            showFilterIcon
            otherClasses="min-h-12 min-w-[170px]"
          />
          <CommonFilter
            filters={collectionSortFilters}
            defaultValue="newest"
            showFilterIcon
            otherClasses="min-h-12 min-w-[170px]"
          />
        </div>

        <DataRender
          success={success}
          data={questions as QuestionType[] | undefined}
          empty={EMPTY_COLLECTIONS}
          error={error}
          render={(savedQuestions) => (
            <div className="mt-10 flex w-full flex-col gap-6">
              {savedQuestions.map((question) => (
                <QuestionCard
                  key={question._id}
                  question={question}
                  showSavedIcon
                />
              ))}
            </div>
          )}
        />

        <Pagination pageNumber={pageNumber} isNext={isNext || false} />
      </section>
    </>
  )
}

export default CollectionPage