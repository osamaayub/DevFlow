import { redirect } from "next/navigation"

import { getSaveQuestions } from "@/features/collections/actions"
import { QuestionFeed } from "@/features/questions/components"
import { auth } from "@/server/auth"
import { BackButton, DataRender } from "@/shared/components/common"
import CommonFilter from "@/shared/components/filters/CommonFilters"
import LocalSearchBar from "@/shared/components/search/LocalSearchBar"
import { CollectionFilters } from "@/shared/constants/filter"
import { QUESTIONS_PER_PAGE } from "@/shared/constants/pagination"
import ROUTES from "@/shared/constants/route"
import { EMPTY_COLLECTIONS } from "@/shared/constants/states"
import { Question as QuestionType, RouteParams } from "@/shared/types"

const CollectionPage = async ({ searchParams }: RouteParams) => {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    redirect(ROUTES.SIGN_IN)
  }

  const { page, pageSize, query, filter, tag } = (await searchParams) || {}
  const pageNumber = Number(page) || 1
  const pageSizeNumber = Number(pageSize) || QUESTIONS_PER_PAGE
  const listFilters = {
    query: typeof query === "string" ? query : "",
    filter: typeof filter === "string" ? filter : "",
    tag: typeof tag === "string" ? tag : "",
  }

  const { success, data, error } = await getSaveQuestions({
    page: pageNumber,
    pageSize: pageSizeNumber,
    ...listFilters,
  })

  const { questions, isNext } = data || {}

  return (
    <>
      <div className="flex flex-col gap-2">
        <BackButton />
        <h1 className="h1-bold text-dark100_light900">Saved Questions</h1>
      </div>

      <section className="mt-11 flex w-full justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearchBar
          route={ROUTES.COLLECTION}
          imgSrc="/icons/search.svg"
          placeholder="Search Saved Questions..."
          otherClasses="w-full flex-1"
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
          <QuestionFeed
            key={JSON.stringify({ pageNumber, pageSizeNumber, ...listFilters })}
            source={{ kind: "saved", ...listFilters }}
            initialQuestions={savedQuestions}
            initialHasMore={isNext || false}
            initialPage={pageNumber}
            pageSize={pageSizeNumber}
            showSavedIcon
          />
        )}
      />
    </>
  )
}

export default CollectionPage