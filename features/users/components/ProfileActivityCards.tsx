import Image from "next/image"
import Link from "next/link"

import { TagCards } from "@/features/tags/components"
import { Votes } from "@/features/votes/components"
import { ConfirmDeleteButton, UserAvatar, RelativeTime } from "@/shared/components/common"
import ROUTES from "@/shared/constants/route"
import { formatNumber } from "@/shared/lib/utils"


export interface TopQuestion {
  _id: string
  title: string
  views: number
  upvotes: number
  answers: number
  createdAt: Date | string
  tags: Array<{ _id: string; name: string }>
}

export interface TopAnswer {
  _id: string
  content: string
  upvotes: number
  downvotes: number
  hasUpVoted: boolean
  hasDownVoted: boolean
  createdAt: Date | string
  question: {
    _id: string
    title: string
    answers: number
    views: number
  } | null
}

interface AuthorProps {
  userId: string
  userName: string
  userImage: string
  action: "asked" | "answered"
  date: Date | string
}

const ActivityAuthor = ({
  userId,
  userName,
  userImage,
  action,
  date,
}: AuthorProps) => (
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
      {action} <RelativeTime date={date} />
    </span>
  </div>
)

interface ActivityStatsProps {
  votes: number
  answers?: number
  views?: number
}

const ActivityStats = ({ votes, answers, views }: ActivityStatsProps) => (
  <div className="flex flex-wrap items-center gap-3 text-[11px] text-dark400_light700 sm:justify-end">
    <span className="flex items-center gap-1">
      <Image src="/icons/like.svg" alt="" width={13} height={13} />
      {formatNumber(votes)} Votes
    </span>
    {answers !== undefined && (
      <span className="flex items-center gap-1">
        <Image src="/icons/message.svg" alt="" width={13} height={13} />
        {formatNumber(answers)} Answers
      </span>
    )}
    {views !== undefined && (
      <span className="flex items-center gap-1">
        <Image src="/icons/eye.svg" alt="" width={14} height={14} />
        {formatNumber(views)} Views
      </span>
    )}
  </div>
)

interface ProfileQuestionCardProps {
  question: TopQuestion
  isOwnProfile: boolean
  isLoading: boolean
  onDelete: (questionId: string) => Promise<boolean>
  userId: string
  userName: string
  userImage: string
}

export const ProfileQuestionCard = ({
  question,
  userId,
  userName,
  userImage,
  isOwnProfile,
  isLoading,
  onDelete,
}: ProfileQuestionCardProps) => (
  <article className="card-wrapper w-full min-w-0 rounded-xl p-4 transition-shadow hover:shadow-md sm:p-5 sm:px-6">
    <div className="flex items-start justify-between gap-3">
      <Link href={ROUTES.QUESTION(question._id)} className="min-w-0 flex-1">
        <h3 className="base-semibold text-dark200_light900 line-clamp-2">
          {question.title}
        </h3>
      </Link>
      {isOwnProfile && (
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={ROUTES.EDIT_QUESTION(question._id)}
            aria-label={`Edit ${question.title}`}
            title="Edit question"
            className="rounded p-1.5 transition hover:bg-sky-500/10"
          >
            <Image src="/icons/edit.svg" alt="" width={16} height={16} />
          </Link>
          <ConfirmDeleteButton
            itemType="question"
            itemTitle={question.title}
            consequence="Its answers and votes will be removed too."
            disabled={isLoading}
            onDelete={() => onDelete(question._id)}
          />
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
      <ActivityAuthor
        userId={userId}
        userName={userName}
        userImage={userImage}
        action="asked"
        date={question.createdAt}
      />
      <ActivityStats
        votes={question.upvotes}
        answers={question.answers}
        views={question.views}
      />
    </div>
  </article>
)

interface ProfileAnswerCardProps {
  answer: TopAnswer
  isOwnProfile: boolean
  isLoading: boolean
  onDelete: (answerId: string) => Promise<boolean>
  userId: string
  userName: string
  userImage: string
}

export const ProfileAnswerCard = ({
  answer,
  isOwnProfile,
  isLoading,
  onDelete,
  userId,
  userName,
  userImage,
}: ProfileAnswerCardProps) => (
  <article className="card-wrapper w-full min-w-0 rounded-xl p-4 transition-shadow hover:shadow-md sm:p-5 sm:px-6">
    <div className="flex items-start justify-between gap-3">
      <Link
        href={
          answer.question ? ROUTES.QUESTION(answer.question._id) : ROUTES.HOME
        }
        className="block min-w-0 flex-1"
      >
        <h3 className="base-semibold text-dark200_light900 line-clamp-2">
          {answer.question?.title ?? "Answer"}
        </h3>
      </Link>
      <div className="flex shrink-0 items-center gap-2">
        {isOwnProfile && (
          <div className="flex items-center gap-1">
            <Link
              href={ROUTES.EDIT_ANSWER(answer._id)}
              aria-label={`Edit your answer to ${answer.question?.title ?? "this question"}`}
              title="Edit answer"
              className="rounded p-1.5 transition hover:bg-sky-500/10"
            >
              <Image src="/icons/edit.svg" alt="" width={16} height={16} />
            </Link>
            <ConfirmDeleteButton
              itemType="answer"
              itemTitle={`your answer to ${answer.question?.title ?? "this question"}`}
              consequence="Its votes will be removed too."
              disabled={isLoading}
              onDelete={() => onDelete(answer._id)}
            />
          </div>
        )}
        {isOwnProfile && (
          <Votes
            targetId={answer._id}
            targetType="answer"
            upvotes={answer.upvotes}
            downvotes={answer.downvotes}
            initialVoteState={{
              hasUpVoted: answer.hasUpVoted,
              hasDownVoted: answer.hasDownVoted,
            }}
          />
        )}
      </div>
    </div>

    <p className="body-regular mt-3 line-clamp-3 text-dark400_light700">
      {answer.content}
    </p>

    <div className="mt-4 grid grid-cols-1 items-center gap-y-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-x-3">
      <ActivityAuthor
        userId={userId}
        userName={userName}
        userImage={userImage}
        action="answered"
        date={answer.createdAt}
      />
      <ActivityStats
        votes={answer.upvotes}
        answers={answer.question?.answers}
        views={answer.question?.views}
      />
    </div>
  </article>
)
