import Link from "next/link"
import { notFound, redirect } from "next/navigation"

import { getAnswerForEdit } from "@/features/answers/actions"
import { EditAnswerForm } from "@/features/answers/components"
import { auth } from "@/server/auth"
import { BackButton } from "@/shared/components/common"
import ROUTES from "@/shared/constants/route"
import { RouteParams } from "@/shared/types"

const EditAnswer = async ({ params }: RouteParams) => {
  const { id } = await params
  if (!id) return notFound()

  const session = await auth()
  if (!session?.user?.id) redirect(ROUTES.SIGN_IN)

  // getAnswerForEdit also rejects anyone who didn't write the answer
  const { success, data: answer, error } = await getAnswerForEdit({ answerId: id })
  if (!success || !answer) {
    if (error?.message?.includes("only edit your own")) redirect(ROUTES.PROFILE(session.user.id))
    return notFound()
  }

  const question = answer.question

  return (
    <div className="mx-auto w-full max-w-4xl">
      <BackButton href={ROUTES.PROFILE(session.user.id)} />

      <h1 className="h1-bold text-dark100_light900 mt-2">Edit Answer</h1>
      {question && (
        <p className="body-regular text-dark400_light500 mt-2">
          Your answer to{" "}
          <Link href={ROUTES.QUESTION(question._id)} className="text-primary-500 hover:underline">
            {question.title}
          </Link>
        </p>
      )}

      <section className="mt-8">
        <EditAnswerForm
          answerId={answer._id}
          content={answer.content}
          returnTo={ROUTES.PROFILE(session.user.id)}
        />
      </section>
    </div>
  )
}

export default EditAnswer
