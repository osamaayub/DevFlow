import { redirect } from "next/navigation"

import { auth } from "@/auth" 
import { QuestionCard } from "@/components/cards"
import CommonFilter from "@/components/filters/CommonFilters"
import { Pagination } from "@/components/navigation"
import LocalSearchBar from "@/components/search/LocalSearchBar"
import { DataRender } from "@/components/shared"
import { CollectionFilters } from "@/constants/filter"
import ROUTES from "@/constants/route"
import { EMPTY_COLLECTIONS } from "@/constants/states"
import { getSaveQuestions } from "@/lib/actions"
import { Question as QuestionType, RouteParams } from "@/types"

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

  const { questions, isNext } = data || {}

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Saved Questions</h1>

      <section className="mt-11 flex w-full justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearchBar
          route={ROUTES.COLLECTION}
          imgSrc="/icons/search.svg"
          placeholder="Search Saved Questions..."
          otherClasses="flex-1"
        />
        <CommonFilter
          filters={CollectionFilters}
          defaultValue="mostrecent"
          showFilterIcon
          otherClasses="min-h-[56px] w-full sm:min-w-[170px]"
        />
      </section>

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
    </>
  )
}

export default CollectionPage