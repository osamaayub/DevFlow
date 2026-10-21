import type { Metadata } from "next"

import { QuestionCard } from "@/features/questions/components"
import { getTagQuestions } from "@/features/tags/actions"
import { BackButton, DataRender } from "@/shared/components/common"
import CommonFilter from "@/shared/components/filters/CommonFilters"
import { Pagination } from "@/shared/components/navigation";
import LocalSearchBar from "@/shared/components/search/LocalSearchBar";
import { TagFilters } from "@/shared/constants/filter"
import { QUESTIONS_PER_PAGE } from "@/shared/constants/pagination"
import ROUTES from "@/shared/constants/route";
import { EMPTY_QUESTION } from "@/shared/constants/states";
import { getSiteUrl } from "@/shared/lib/seo"
import { RouteParams, Question } from "@/shared/types";

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { id } = await params
  const result = await getTagQuestions({ tagId: id, page: 1, pageSize: 1 })
  const tagName = result.success ? result.data?.tag?.name : undefined
  if (!tagName) return { title: "Tag not found", robots: { index: false, follow: false } }

  const description = `Explore programming questions and answers about ${tagName} on DevFlow.`
  return {
    title: `${tagName} Questions`,
    description,
    alternates: { canonical: `${getSiteUrl()}/tags/${id}` },
    openGraph: { type: "website", title: `${tagName} Questions`, description },
    twitter: { card: "summary", title: `${tagName} Questions`, description }
  }
}


const Page = async ({ params, searchParams }: RouteParams) => {
  const { id } = await params;
  const resolvedSearchParams = await searchParams
  const { page, pageSize, query, filter } = resolvedSearchParams || {};
  const pageNumber = Number(page) || 1;
  const pageSizeNumber = Number(pageSize) || QUESTIONS_PER_PAGE;
  const queryValue = typeof query === "string" ? query : undefined;
  const filterValue = typeof filter === "string" ? filter : undefined;

  const { success, data, error } = await getTagQuestions({
    tagId: id,
    page: pageNumber,
    pageSize: pageSizeNumber,
    query: queryValue,
    filter: filterValue,
  });

  const { tag, questions,isNext } = data || {};

  return (
    <>
      <section className="flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center">
        <div className="relative">
          <BackButton href={ROUTES.TAGS} className="absolute top-0 left-0" />
          <h1 className="h1-bold text-dark100_light900 pt-10">{tag?.name}</h1>
        </div>
      </section>

      <section className="mt-11 flex w-full items-center justify-between gap-3 max-sm:flex-col">
        <LocalSearchBar
          route={ROUTES.TAG(id)}
          imgSrc="/icons/search.svg"
          placeholder="Search questions..."
          otherClasses="w-full flex-1"
        />
        {questions && questions.length > 0 && (
          <CommonFilter
            filters={TagFilters}
            defaultValue="popular"
            showFilterIcon
            otherClasses="min-h-[56px] w-full sm:min-w-[170px]"
            containerClasses="max-sm:w-full"
          />
        )}
      </section>

      <DataRender
        success={success}
        error={error}
        data={questions as unknown as Question[] | undefined}
        empty={EMPTY_QUESTION}
        render={(questions: Question[]) => (
          <div className="mt-10 flex w-full flex-col gap-6">
            {questions.map((question) => (
              <QuestionCard key={question._id} question={question} />
            ))}
          </div>
        )}
      />
      <Pagination pageNumber={pageNumber} isNext={isNext || false} />
    </>
  )
};

export default Page;
