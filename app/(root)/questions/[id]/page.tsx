import Link from "next/link"
import { redirect } from "next/navigation"
import { after } from "next/server"
import { Suspense } from "react"

import { auth } from "@/auth"
import AllAnswers from "@/components/answers/AllAnswers"
import { TagCards } from "@/components/cards"
import { Preview } from "@/components/editor/preview"
import { AnswerForm } from "@/components/forms"
import { SaveQuestion } from "@/components/questions"
import { Metric, UserAvatar } from "@/components/shared"
import { Votes } from "@/components/votes"
import ROUTES from "@/constants/route"
import {
  formatNumber,
  getAnswers,
  getQuestion,
  getTimeStamp,
  hasVoted,
  incrementQuestionViews,
} from "@/lib"
import { Answer, RouteParams } from "@/types"

const QuestionDetails = async ({
  params,
  searchParams,
}: RouteParams) => {
  const { id } = await params
  const { page, pageSize, filter } = (await searchParams) || {}
  const pageNumber = Number(page) || 1
  const pageSizeNumber = Number(pageSize) || 10

  const session = await auth()
  const userId = session?.user?.id

  const [{ success, data: question }, answersResult] =
    await Promise.all([
      getQuestion({
        questionId: id,
      }),
      getAnswers({
        questionId: id,
        page: pageNumber,
        pageSize: pageSizeNumber,
        filter: typeof filter === "string" ? filter : undefined,
      }),
    ])

  if (!success || !question) {
    redirect("/404")
  }

  after(async () => {
    await incrementQuestionViews({
      questionId: id,
    })
  })

  const viewCount = question.views + 1

  const {
    author,
    createdAt,
    answers,
    tags,
    content,
    title,
  } = question

  const answersSuccess = answersResult.success

  const answersData =
    answersSuccess && answersResult.data
      ? (answersResult.data.answers as unknown as Answer[])
      : []

  const totalAnswers =
    answersSuccess && answersResult.data
      ? answersResult.data.totalAnswers
      : 0

  const isNext =
    answersSuccess && answersResult.data
      ? answersResult.data.isNext
      : false

  const answersError =
    !answersSuccess ? answersResult.error : undefined

  const questionHasVotedPromise = hasVoted({
    targetId: id,
    targetType: "question",
  })

  return (
    <>
      <div className="flex-start w-full flex-col">
        <div className="flex w-full flex-col-reverse justify-between">
          <div className="flex items-center justify-start gap-1">
            <UserAvatar
              id={author._id.toString()}
              name={author.name}
              className="size-5.5"
              fallbackClassName="text-[10px]"
            />

            <Link
              href={ROUTES.PROFILE(author._id.toString())}
            >
              <p className="paragraph-semibold text-dark300_light700">
                {author.name}
              </p>
            </Link>
          </div>

          <div className="flex justify-end gap-3">
            <Votes
              targetId={id}
              targetType="question"
              upvotes={question.upvotes}
              downvotes={question.downvotes}
              hasVotedPromise={questionHasVotedPromise}
            />
            <Suspense
              fallback={
                <div
                  role="status"
                  aria-label="Loading save question"
                  className="size-9 animate-pulse rounded-md bg-light-800 dark:bg-dark-300"
                />
              }
            >
              <SaveQuestion questionId={question._id} />
            </Suspense>
          </div>
        </div>

        <h2 className="h2-semibold text-dark200_light900 mt-3.5 w-full">
          {title}
        </h2>
      </div>

      <div className="mt-5 mb-8 flex flex-wrap gap-4">
        <Metric
          imgUrl="/icons/clock.svg"
          alt="clock icon"
          value={` asked ${getTimeStamp(new Date(createdAt))}`}
          title=""
          textStyles="small-regular text-dark400_light700"
        />

        <Metric
          imgUrl="/icons/message.svg"
          alt="message icon"
          value={answers}
          title="Answers"
          textStyles="small-regular text-dark400_light700"
        />

        <Metric
          imgUrl="/icons/eye.svg"
          alt="eye icon"
          value={formatNumber(viewCount)}
          title="Views"
          textStyles="small-regular text-dark400_light700"
        />
      </div>

      <Preview content={content} />

      <div className="mt-8 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <TagCards
            key={tag._id.toString()}
            _id={tag._id.toString()}
            name={tag.name}
            compact
          />
        ))}
      </div>

      <section className="my-5">
        <AllAnswers
          key={typeof filter === "string" ? filter : "latest"}
          data={answersData}
          success={answersSuccess}
          error={answersError}
          page={pageNumber}
          isNext={isNext}
          totalAnswers={totalAnswers}
        />
      </section>

      <section className="mt-5">
        {userId ? (
          <AnswerForm
            questionId={id}
            content={content}
            question={title}
          />
        ) : (
          <div className="mt-8 rounded-md border border-light-700 p-6 text-center dark:border-dark-400">
            <p className="text-dark400_light800 paragraph-semibold">
              Please{" "}
              <Link
                href={ROUTES.SIGN_IN}
                className="text-primary-500 underline"
              >
                log in
              </Link>{" "}
              to write an answer.
            </p>
          </div>
        )}
      </section>
    </>
  )
}

export default QuestionDetails
