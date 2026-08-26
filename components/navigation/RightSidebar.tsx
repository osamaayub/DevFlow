import Image from "next/image"
import Link from "next/link"

import DataRenderer from "@/components/shared/DataRender"
import Routes from "@/constants/route"
import { getQuestions } from "@/lib/actions"

import TagCards from "../cards/TagCards"

const RightSidebar = async () => {
  const response = await getQuestions({
    page: 1,
    pageSize: 10,
  })

  const getPopularTags = () => {
    if (!response.data?.questions || response.data.questions.length === 0) {
      return []
    }

    const tagMap = new Map<string, { _id: string; name: string; count: number }>()

    // Iterate through questions and collect tags
    response.data.questions.forEach((question) => {
      if (question.tags && Array.isArray(question.tags)) {
        question.tags.forEach((tag) => {
          if (tagMap.has(tag._id)) {
            const existing = tagMap.get(tag._id)!
            existing.count += 1
          } else {
            tagMap.set(tag._id, {
              _id: tag._id,
              name: tag.name,
              count: 1
            })
          }
        })
      }
    })

    // Convert to array and sort by count (most popular first)
    return Array.from(tagMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5) // Show top 5 tags
  }

  const popularTags = getPopularTags()

  return (
    <section className="pt-24 custom-scrollbar background-light900_dark200 light-border sticky right-0 top-0 flex h-screen w-[350px] flex-col gap-6 overflow-y-auto border-l p-6 shadow-light-300 dark:shadow-none max-xl:hidden">
      {/* Hot Questions Section */}
      <div>
        <h3 className="h3-bold text-dark200_light900">Hot Questions</h3>

        <DataRenderer
          success={response.success}
          error={response.error}
          data={response.data?.questions}
          empty={{
            title: "No Questions",
            message: "Check back soon for new questions!"
          }}
          render={(questions) => (
            <div className="mt-7 flex w-full flex-col gap-7.5">
              {questions.map(({ _id, title }) => (
                <Link
                  key={_id}
                  href={Routes.PROFILE(_id)}
                  className="flex cursor-pointer items-center justify-between gap-7"
                >
                  <p className="body-medium text-dark500_light700 truncate">{title}</p>
                  <Image
                    src={'/icons/chevron-right.svg'}
                    alt="chevron"
                    width={20}
                    height={20}
                    className="invert-colors flex-shrink-0"
                  />
                </Link>
              ))}
            </div>
          )}
        />
      </div>

      {/* Popular Tags Section - Now Dynamic */}
      <div className="mt-16">
        <h3 className="h3-bold text-dark200_light900">Popular Tags</h3>
        <div className="mt-7 flex flex-col gap-4">
          {popularTags.length > 0 ? (
            popularTags.map(({ _id, name, count }) => (
              <TagCards
                key={_id}
                _id={_id}
                name={name}
                questions={count} // Show actual count instead of hardcoded
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