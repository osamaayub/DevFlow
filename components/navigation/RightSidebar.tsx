import Image from "next/image"
import Link from "next/link"

import { TagCards } from "@/components/cards"
import ROUTES from "@/constants/route"
import { getQuestions } from "@/lib/actions"

const RightSidebar = async () => {
  const response = await getQuestions({
    page: 1,
    pageSize: 5,
    filter: "popular",
  })
  const questions = response.data?.questions ?? []

  const tagMap = new Map<string, { _id: string; name: string; count: number }>()
  questions.forEach((question) => {
    question.tags?.forEach((tag) => {
      const existingTag = tagMap.get(tag._id)
      if (existingTag) {
        existingTag.count += 1
      } else {
        tagMap.set(tag._id, { _id: tag._id, name: tag.name, count: 1 })
      }
    })
  })

  const popularTags = Array.from(tagMap.values())
    .sort((first, second) => second.count - first.count)
    .slice(0, 5)

  return (
    <section className="pt-28 custom-scrollbar background-light900_dark200 light-border sticky right-0 top-0 flex h-screen w-[350px] flex-col gap-6 overflow-y-auto border-l p-6 shadow-light-300 dark:shadow-none max-xl:hidden">
      <div>
        <h3 className="h3-bold text-dark200_light900">Hot Questions</h3>
        {questions.length > 0 ? (
          <ul className="mt-5 flex flex-col gap-4">
            {questions.map((question) => (
              <li key={question._id} className="flex items-start gap-3">
                <Image
                  src="/icons/question.svg"
                  alt=""
                  width={18}
                  height={18}
                  className="mt-0.5 shrink-0 invert-colors"
                />
                <Link
                  href={ROUTES.QUESTION(question._id)}
                  className="body-regular text-dark400_light700 line-clamp-2 hover:text-primary-500"
                >
                  {question.title}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-5 flex flex-col items-center gap-3 text-center">
            <Image
              src="/icons/question.svg"
              alt=""
              width={32}
              height={32}
              className="invert-colors"
            />
            <p className="body-regular text-dark500_light700">
              No questions available yet.
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 border-t border-light-700 pt-6 dark:border-dark-400">
        <h3 className="h3-bold text-dark200_light900">Popular Tags</h3>
        <div className="mt-5 flex flex-col gap-3">
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
              No tags available yet.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

export default RightSidebar