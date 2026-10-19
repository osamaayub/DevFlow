import Link from "next/link"
import { redirect } from "next/navigation"
import { after } from "next/server"
import { Suspense } from "react"

import { getAnswers } from "@/features/answers/actions"
import { AllAnswers } from "@/features/answers/components"
import { AnswerForm } from "@/features/answers/components"
import { recordInteraction } from "@/features/interaction/service"
import { getQuestion, incrementQuestionViews } from "@/features/questions/actions"
import { SaveQuestion } from "@/features/questions/components"
import { TagCards } from "@/features/tags/components"
import { hasVoted } from "@/features/votes/actions"
import { Votes } from "@/features/votes/components"
import { auth } from "@/server/auth"
import { BackButton, Metric, UserAvatar } from "@/shared/components/common"
import { Preview } from "@/shared/components/editor/preview"
import ROUTES from "@/shared/constants/route"
import logger from "@/shared/lib/logger"
import { formatNumber, getTimeStamp } from "@/shared/lib/utils"
import { Answer, RouteParams } from "@/shared/types"

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

  // The session can't be read inside after() on a page, so the user and the question's
  // author are captured here, during the render
  const questionAuthorId = String(question.author?._id ?? "")

  after(async () => {
    await incrementQuestionViews({
      questionId: id,
    })

    // Signed-in users get a "view" interaction for their activity history (no reputation)
    if (userId) {
      try {
        await recordInteraction({
          userId,
          action: "view",
          actionTarget: "question",
          actionId: id,
          authorId: questionAuthorId || undefined,
        })
      } catch (error) {
        logger.error({ questionId: id, error }, "Failed to record question view interaction")
      }
    }
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
      <div className="flex w-full flex-col items-start">
        <BackButton />

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

        <div className="relative mt-3.5 w-full">
          <h2 className="h2-semibold text-dark200_light900 w-full">
            {title}
          </h2>
        </div>
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
