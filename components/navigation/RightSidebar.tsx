import { QuestionCard, TagCards } from "@/components/cards"
import { DataRender } from "@/components/shared"
import { getQuestions } from "@/lib/actions"
import { Question } from "@/types"

const RightSidebar = async () => {
  const response = await getQuestions({
    page: 1,
    pageSize: 10,
  })

  const getPopularTags = () => {
    if (!response.data?.questions || response.data.questions.length === 0) {
      return []
    }

    const tagMap = new Map<
      string,
      {
        _id: string
        name: string
        count: number
      }
    >()

    response.data.questions.forEach((question: Question) => {
      if (question.tags && Array.isArray(question.tags)) {
        question.tags.forEach((tag) => {
          if (tagMap.has(tag._id)) {
            const existing = tagMap.get(tag._id)!

            existing.count += 1
          } else {
            tagMap.set(tag._id, {
              _id: tag._id,
              name: tag.name,
              count: 1,
            })
          }
        })
      }
    })

    return Array.from(tagMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }

  const popularTags = getPopularTags()

  return (
    <section className="pt-24 custom-scrollbar background-light900_dark200 light-border sticky right-0 top-0 flex h-screen w-[350px] flex-col gap-6 overflow-y-auto border-l p-6 shadow-light-300 dark:shadow-none max-xl:hidden">
      {/* Hot Questions */}
      <div>
        <h3 className="h3-bold text-dark200_light900">
          Hot Questions
        </h3>

        <DataRender
          success={response.success}
          error={response.error}
          data={response.data?.questions}
          empty={{
            title: "No Questions",
            message: "Check back soon for new questions!",
          }}
          render={(questions: Question[]) => (
            <div className="mt-7 flex w-full flex-col gap-4">
              {questions.map((question) => (
                <QuestionCard
                  key={question._id}
                  question={question}
                />
              ))}
            </div>
          )}
        />
      </div>

      {/* Popular Tags */}
      <div className="mt-16">
        <h3 className="h3-bold text-dark200_light900">
          Popular Tags
        </h3>

        <div className="mt-7 flex flex-col gap-4">
          {popularTags.length > 0 ? (
            popularTags.map(({ _id, name, count }) => (
              <TagCards
                key={_id}
                _id={_id}
                name={name}
                questions={count}
                showCount
                compact
              />
            ))
          ) : (
            <p className="body-regular text-dark500_light700">
              No tags available yet
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

export default RightSidebar