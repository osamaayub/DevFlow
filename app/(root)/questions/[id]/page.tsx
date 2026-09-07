import Link from "next/link"
import { redirect } from "next/navigation"
import { after } from "next/server"

import { auth } from "@/auth" 
import { TagCards } from "@/components/cards"
import { Preview } from "@/components/editor/preview"
import { AnswerForm } from "@/components/forms"
import { Metric, UserAvatar } from "@/components/shared"
import ROUTES from "@/constants/route"
import { getQuestion, incrementQuestionViews } from "@/lib/actions"
import { formatNumber, getTimeStamp } from "@/lib/utils"

const QuestionDetails = async ({ params }: RouteParams) => {
  const { id } = await params
  
  // 1. Fetch the logged-in user's session
  const session = await auth()
  const userId = session?.user?.id

  // 2. Fetch the question details
  const { success, data: question } = await getQuestion({ questionId: id })

  if (!success || !question) return redirect("/404")

  // 3. Increment views non-blockingly
  after(async () => {
    await incrementQuestionViews({ questionId: id })
  })

  const viewCount = question.views + 1
  const { author, createdAt, answers, tags, content, title } = question

  return (
    <>
      <div className="flex-start w-full flex-col">
        <div className="flex w-full flex-col-reverse justify-between">
          <div className="flex items-center justify-start gap-1">
            <UserAvatar
              id={author._id}
              name={author.name}
              className="size-[22px]"
              fallbackClassName="text-[10px]"
            />
            <Link href={ROUTES.PROFILE(author._id)}>
              <p className="paragraph-semibold text-dark300_light700">{author.name}</p>
            </Link>
          </div>

          <div className="flex justify-end">
            <p>Votes</p>
          </div>
        </div>

        <h2 className="h2-semibold text-dark200_light900 mt-3.5 w-full">{title}</h2>
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
          <TagCards key={tag._id} _id={tag._id as string} name={tag.name} compact />
        ))}
      </div>
      
      <section className="mt-5">
        {/* 4. Conditionally render the AnswerForm if the user is logged in */}
        {userId ? (
          <AnswerForm 
            questionId={id} 
            authorId={userId} 
            content={content} 
          />
        ) : (
          <div className="mt-8 rounded-md border border-light-700 p-6 text-center dark:border-dark-400">
            <p className="text-dark400_light800 paragraph-semibold">
              Please <Link href={ROUTES.SIGN_IN || "/sign-in"} className="text-primary-500 underline">log in</Link> to write an answer.
            </p>
          </div>
        )}
      </section>
    </>
  )
}

export default QuestionDetails