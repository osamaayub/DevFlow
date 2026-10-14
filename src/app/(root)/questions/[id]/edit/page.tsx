import { notFound, redirect } from "next/navigation"
import React from "react"

import { getQuestion } from "@/features/questions/actions"
import { QuestionForm } from "@/features/questions/components"
import { auth } from "@/server/auth"
import ROUTES from "@/shared/constants/route"
import { RouteParams} from "@/shared/types"

const normalizeAuthorId = (author: unknown): string | undefined => {
  if (!author) return undefined

  if (typeof author === "string") return author

  if (typeof author === "object") {
    const authorRecord = author as { _id?: unknown; id?: unknown }
    if (authorRecord._id != null) return String(authorRecord._id)
    if (authorRecord.id != null) return String(authorRecord.id)
  }

  return String(author)
}

const EditQuestion = async ({ params }: RouteParams) => {
  const { id } = await params
  if (!id) return notFound()

  const session = await auth()
  if (!session?.user?.id) return redirect("/sign-in")

  const { data: question, success } = await getQuestion({ questionId: id })
  if (!success || !question) return notFound()

  const questionAuthorId = normalizeAuthorId(question.author)

  if (questionAuthorId !== session.user.id) {
    redirect(ROUTES.QUESTION(id))
  }

  const safeQuestion = JSON.parse(JSON.stringify(question))

  return (
    <main className="mt-9">
      <>
        <QuestionForm question={safeQuestion} isEdit />
      </>
    </main>
  )
}

export default EditQuestion
