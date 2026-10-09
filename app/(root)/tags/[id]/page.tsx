import { QuestionCard } from "@/components/cards"
import CommonFilter from "@/components/filters/CommonFilters"
import { Pagination } from "@/components/navigation";
import LocalSearchBar from "@/components/search/LocalSearchBar";
import { BackButton, DataRender } from "@/components/shared"
import { TagFilters } from "@/constants/filter"
import ROUTES from "@/constants/route";
import { EMPTY_QUESTION } from "@/constants/states";
import { getTagQuestions } from "@/lib/actions";
import { RouteParams, Question } from "@/types";


const Page = async ({ params, searchParams }: RouteParams) => {
  const { id } = await params;
  const resolvedSearchParams = await searchParams
  const { page, pageSize, query, filter } = resolvedSearchParams || {};
  const pageNumber = Number(page) || 1;

  const { success, data, error } = await getTagQuestions({
    tagId: id,
    page: pageNumber,
    pageSize: Number(pageSize) || 10,
    query: typeof query === "string" ? query : undefined,
    filter: typeof filter === "string" ? filter : undefined,
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