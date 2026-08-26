import Image from "next/image"
import Link from "next/link"

import DataRenderer from "@/components/shared/DataRender"
import Routes from "@/constants/route"
import { getQuestions } from "@/lib/actions"

import TagCards from "../cards/TagCards"


const popularTags = [
  { _id: "1", name: "react", questions: 100 },
  { _id: "2", name: "javascript", questions: 200 },
  { _id: "3", name: "typescript", questions: 150 },
  { _id: "4", name: "nextjs", questions: 50 },
  { _id: "5", name: "git", questions: 75 },
]

const RightSidebar = async () => {
  const response = await getQuestions({
    page: 1,
    pageSize: 5,
  })

  return (
    <section className="pt-24 custom-scrollbar background-light900_dark200 light-border sticky right-0 top-0 flex h-screen w-[350px] flex-col gap-6 overflow-y-auto border-l p-6 shadow-light-300 dark:shadow-none max-xl:hidden">
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

      <div className="mt-16">
        <h3 className="h3-bold text-dark200_light900">Popular Tags</h3>
        <div className="mt-7 flex flex-col gap-4">
          {popularTags.map(({ _id, name, questions }) => (
            <TagCards
              key={_id}
              _id={_id}
              name={name}
              questions={questions}
              showCount
              compact
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default RightSidebar