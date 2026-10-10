import { headers } from "next/headers"

import { getQuestions } from "@/lib/actions"

import HotNetwork from "./HotNetwork"
import PopularTags from "./PopularTags"

const SIDEBAR_QUESTION_LIMIT = 5
const DEFAULT_QUESTION_FILTER = "popular"
const QUESTION_FILTERS = new Set([
  "popular",
  "newest",
  "unanswered",
  "recommended",
  "frequent",
])

const getQuestionFilter = (value: string | null) =>
  value && QUESTION_FILTERS.has(value) ? value : DEFAULT_QUESTION_FILTER

const RightSidebar = async () => {
  const questionFilter = getQuestionFilter(
    (await headers()).get("x-devflow-question-filter")
  )
  const { success, data, error } = await getQuestions({
    page: 1,
    pageSize: SIDEBAR_QUESTION_LIMIT,
    filter: questionFilter,
  })

  const questions = success ? data?.questions ?? [] : []
  const errorMessage = success
    ? undefined
    : error?.message ?? "Failed to load sidebar questions."

  return (
    <section className="pt-28 custom-scrollbar background-light900_dark200 light-border sticky right-0 top-0 flex h-screen w-[350px] flex-col gap-6 overflow-y-auto border-l p-6 shadow-light-300 dark:shadow-none max-xl:hidden">
      <HotNetwork questions={questions} error={errorMessage} />
      <PopularTags questions={questions} error={errorMessage} />
    </section>
  )
}

export default RightSidebar
