"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { deleteQuestion } from "@/features/questions/actions"
import { TagCards } from "@/features/tags/components"
import { getUserActivity } from "@/features/users/actions"
import { UserAvatar, RelativeTime } from "@/shared/components/common"
import { Button } from "@/shared/components/ui"
import ROUTES from "@/shared/constants/route"
import { formatNumber } from "@/shared/lib/utils"

interface TopQuestion {
  _id: string
  title: string
  views: number
  upvotes: number
  answers: number
  createdAt: Date | string
  tags: Array<{ _id: string; name: string }>
}

interface TopAnswer {
  _id: string
  content: string
  upvotes: number
  createdAt: Date | string
  question: {
    _id: string
    title: string
    answers: number
    views: number
  } | null
}

interface Props {
  userId: string
  userName: string
  userImage: string
  isOwnProfile: boolean
  totalQuestions: number
  totalAnswers: number
  topQuestions: TopQuestion[]
  topAnswers: TopAnswer[]
}

type ActivityType = "questions" | "answers"

const PAGE_SIZE = 3

const ProfileActivity = ({
  userId,
  userName,
  userImage,
  isOwnProfile,
  totalQuestions,
  totalAnswers,
  topQuestions,
  topAnswers,
}: Props) => {
  const router = useRouter()
  const [activityType, setActivityType] = useState<ActivityType>("questions")
  const [questions, setQuestions] = useState(topQuestions)
  const [answers, setAnswers] = useState(topAnswers)
  const [hasMore, setHasMore] = useState(
    topQuestions.length < totalQuestions
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const currentCount = activityType === "questions" ? questions.length : answers.length
  const currentTotal =
    activityType === "questions" ? totalQuestions : totalAnswers

  const selectActivity = (type: ActivityType) => {
    setActivityType(type)
    setHasMore(
      (type === "questions" ? questions.length : answers.length) <
        (type === "questions" ? totalQuestions : totalAnswers)
    )
    setError("")
  }

  const loadMore = async () => {
    setIsLoading(true)
    setError("")

    try {
      const result = await getUserActivity({
        userId,
        type: activityType,
        page: Math.floor(currentCount / PAGE_SIZE) + 1,
        pageSize: PAGE_SIZE,
      })

      if (!result.success || !result.data) {
        setError(result.error?.message ?? "Failed to load more activity.")
        return
      }

      if (activityType === "questions") {
        setQuestions((current) => [
          ...current,
          ...(result.data?.questions ?? []),
        ])
      } else {
        setAnswers((current) => [...current, ...(result.data?.answers ?? [])])
      }
      setHasMore(result.data.isNext)
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load more activity. Please try again."
      )
    } finally {
      setIsLoading(false)
    }
  }

  const removeQuestion = async (questionId: string) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return

    setIsLoading(true)
    setError("")

    try {
      const result = await deleteQuestion({ questionId })
      if (!result.success) {
        setError(result.error?.message ?? "Failed to delete this post.")
        return
      }
      router.refresh()
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete this post. Please try again."
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mt-10 grid grid-cols-1 gap-8">
      <section className="min-w-0">
        <div className="mb-5 flex items-center gap-1">
          <button
            type="button"
            aria-pressed={activityType === "questions"}
            onClick={() => selectActivity("questions")}
            className={`rounded-l-md px-4 py-2 text-sm transition ${
              activityType === "questions"
                ? "bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-300"
                : "bg-light-800 text-dark400_light700 dark:bg-dark-300"
            }`}
          >
            Top Posts
          </button>
          <button
            type="button"
            aria-pressed={activityType === "answers"}
            onClick={() => selectActivity("answers")}
            className={`rounded-r-md px-4 py-2 text-sm transition ${
              activityType === "answers"
                ? "bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-300"
                : "bg-light-800 text-dark400_light700 dark:bg-dark-300"
            }`}
          >
            Answers
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {activityType === "questions" ? (
            questions.length > 0 ? (
              questions.map((question) => (
                <article
                  key={question._id}
                  className="card-wrapper w-full rounded-[10px] p-5 sm:px-6"
                >
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={ROUTES.QUESTION(question._id)}
                      className="min-w-0 flex-1"
                    >
                      <h3 className="base-semibold text-dark200_light900 line-clamp-2">
                        {question.title}
                      </h3>
                    </Link>
                    {isOwnProfile && (
                      <div className="flex shrink-0 items-center gap-2">
                        <Link
                          href={`/questions/${question._id}/edit`}
                          aria-label={`Edit ${question.title}`}
                          className="rounded p-1.5 text-sky-500 transition hover:bg-sky-500/10"
                        >
                          <Image
                            src="/icons/edit.svg"
                            alt=""
                            width={16}
                            height={16}
                          />
                        </Link>
                        <button
                          type="button"
                          aria-label={`Delete ${question.title}`}
                          disabled={isLoading}
                          onClick={() => removeQuestion(question._id)}
                          className="rounded p-1.5 text-red-500 transition hover:bg-red-500/10 disabled:opacity-50"
                        >
                          <Image
                            src="/icons/trash.svg"
                            alt=""
                            width={16}
                            height={16}
                          />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {question.tags.map((tag) => (
                      <TagCards
                        key={`${question._id}-${tag._id}`}
                        _id={tag._id}
                        name={tag.name}
                        compact
                      />
                    ))}
                  </div>

                  <div className="mt-4 grid grid-cols-1 items-center gap-y-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-x-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <UserAvatar
                        id={userId}
                        name={userName}
                        image={userImage}
                        disableLink
                        className="size-5 rounded-full object-cover"
                        fallbackClassName="text-[10px]"
                      />
                      <span className="small-medium max-w-32 truncate text-dark300_light900 sm:max-w-40">
                        {userName}
                      </span>
                      <span className="subtle-regular min-w-0 truncate text-dark400_light700">
                        asked <RelativeTime date={question.createdAt} />
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-dark400_light700 sm:justify-end">
                      <span className="flex items-center gap-1">
                        <Image src="/icons/like.svg" alt="" width={13} height={13} />
                        {formatNumber(question.upvotes)} Votes
                      </span>
                      <span className="flex items-center gap-1">
                        <Image src="/icons/message.svg" alt="" width={13} height={13} />
                        {formatNumber(question.answers)} Answers
                      </span>
                      <span className="flex items-center gap-1">
                        <Image src="/icons/eye.svg" alt="" width={14} height={14} />
                        {formatNumber(question.views)} Views
                      </span>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <p className="body-regular py-6 text-dark400_light700">
                No posts yet.
              </p>
            )
          ) : answers.length > 0 ? (
            answers.map((answer) => (
              <article
                key={answer._id}
                className="card-wrapper w-full rounded-[10px] p-5 sm:px-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <Link
                    href={
                      answer.question
                        ? ROUTES.QUESTION(answer.question._id)
                        : ROUTES.HOME
                    }
                    className="min-w-0 flex-1"
                  >
                    <h3 className="base-semibold text-dark200_light900 line-clamp-2">
                      {answer.question?.title ?? "Answer"}
                    </h3>
                  </Link>
                </div>

                <p className="body-regular mt-3 line-clamp-3 text-dark400_light700">
                  {answer.content}
                </p>

                <div className="mt-4 grid grid-cols-1 items-center gap-y-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-x-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <UserAvatar
                      id={userId}
                      name={userName}
                      image={userImage}
                      disableLink
                      className="size-5 shrink-0 rounded-full object-cover"
                      fallbackClassName="text-[10px]"
                    />
                    <span className="small-medium max-w-32 truncate text-dark300_light900 sm:max-w-40">
                      {userName}
                    </span>
                    <span className="subtle-regular min-w-0 truncate text-dark400_light700">
                      answered <RelativeTime date={answer.createdAt} />
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-dark400_light700 sm:justify-end">
                    <span className="flex items-center gap-1">
                      <Image src="/icons/like.svg" alt="" width={13} height={13} />
                      {formatNumber(answer.upvotes)} Votes
                    </span>
                    {answer.question && (
                      <>
                        <span className="flex items-center gap-1">
                          <Image
                            src="/icons/message.svg"
                            alt=""
                            width={13}
                            height={13}
                          />
                          {formatNumber(answer.question.answers)} Answers
                        </span>
                        <span className="flex items-center gap-1">
                          <Image
                            src="/icons/eye.svg"
                            alt=""
                            width={14}
                            height={14}
                          />
                          {formatNumber(answer.question.views)} Views
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </article>
            ))
          ) : (
            <p className="body-regular py-6 text-dark400_light700">
              No answers yet.
            </p>
          )}
        </div>

        {error && (
          <p role="alert" className="body-regular mt-4 text-red-500">
            {error}
          </p>
        )}

        {hasMore && (
          <div className="mt-5 flex justify-center">
            <Button
              type="button"
              onClick={loadMore}
              disabled={isLoading}
              className="primary-gradient min-h-10 min-w-28 px-5 py-2 text-sm text-light-900"
            >
              {isLoading ? "Loading..." : "Load More"}
            </Button>
          </div>
        )}
        <span className="sr-only" aria-live="polite">
          Showing {currentCount} of {currentTotal}{" "}
          {activityType === "questions" ? "posts" : "answers"}
        </span>
      </section>

    </div>
  )
}

export default ProfileActivity
