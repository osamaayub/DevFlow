import { QuestionFeed } from "@/features/questions/components"
import { getTagQuestions } from "@/features/tags/actions"
import { BackButton, DataRender } from "@/shared/components/common"
import CommonFilter from "@/shared/components/filters/CommonFilters"
import LocalSearchBar from "@/shared/components/search/LocalSearchBar";
import { TagFilters } from "@/shared/constants/filter"
import { QUESTIONS_PER_PAGE } from "@/shared/constants/pagination"
import ROUTES from "@/shared/constants/route";
import { EMPTY_QUESTION } from "@/shared/constants/states";
import { RouteParams, Question } from "@/shared/types";


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
          <QuestionFeed
            key={`${id}|${queryValue ?? ""}|${filterValue ?? ""}|${pageNumber}|${pageSizeNumber}`}
            source={{ kind: "tag", tagId: id, query: queryValue, filter: filterValue }}
            initialQuestions={questions}
            initialHasMore={isNext || false}
            initialPage={pageNumber}
            pageSize={pageSizeNumber}
          />
        )}
      />
    </>
  )
};

export default Page;