import { QuestionCard } from "@/components/cards"
import CommonFilter from "@/components/filters/CommonFilters"
import LocalSearchBar from "@/components/search/LocalSearchBar";
import { DataRender } from "@/components/shared"
import { TagFilters } from "@/constants/filter"
import ROUTES from "@/constants/route";
import { EMPTY_QUESTION } from "@/constants/states";
import { getTagQuestions } from "@/lib/actions";
import { RouteParams, Question } from "@/types";


const Page = async ({ params, searchParams }: RouteParams) => {
  const { id } = await params;
  const resolvedSearchParams = await searchParams
  const { page, pageSize} = resolvedSearchParams || {};

  const { success, data, error } = await getTagQuestions({
    tagId: id,
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
  });

  const { tag, questions } = data || {};

  return (
    <>
      <section className="flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="h1-bold text-dark100_light900">{tag?.name}</h1>
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
            otherClasses="min-h-[56px] w-full sm:w-[160px]"
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
    </>
  )
};

export default Page;