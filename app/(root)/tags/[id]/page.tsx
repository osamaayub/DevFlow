import QuestionCard from "@/components/cards/QuestionCard";
import LocalSearchBar from "@/components/search/LocalSearchBar";
import DataRenderer from "@/components/shared/DataRender";
import ROUTES from "@/constants/route";
import { EMPTY_QUESTION } from "@/constants/states";
import { getTagQuestions } from "@/lib/actions";


const Page = async ({ params, searchParams }: RouteParams) => {
  const { id } = await params;
  const { page, pageSize, query } = await searchParams;

  const { success, data, error } = await getTagQuestions({
    tagId: id,
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
    query,
  });

  const { tag, questions } = data || {};

  return (
    <>
      <section className="flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="h1-bold text-dark100_light900">{tag?.name}</h1>
      </section>

      <section className="mt-11">
        <LocalSearchBar
          route={ROUTES.TAG(id)}
          imgSrc="/icons/search.svg"
          placeholder="Search questions..."
          otherClasses="flex-1"
        />
      </section>

      <DataRenderer
        success={success}
        error={error}
        data={questions}
        empty={EMPTY_QUESTION}
        render={(questions) => (
          <div className="mt-10 flex w-full flex-col gap-6">
            {questions.map((question) => (
              <QuestionCard key={question._id} question={question} />
            ))}
          </div>
        )}
      />
    </>
  );
};

export default Page;