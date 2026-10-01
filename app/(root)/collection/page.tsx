import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { QuestionCard } from "@/components/cards"
import { DataRender } from "@/components/shared"
import ROUTES from "@/constants/route"
import { EMPTY_COLLECTIONS } from "@/constants/states"
import { Collection } from "@/database"
import { dbConnect } from "@/lib/mongoose"
import { Question as QuestionType } from "@/types"

const CollectionPage = async () => {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    redirect(ROUTES.SIGN_IN)
  }

  await dbConnect()

  const savedCollections = await Collection.find({ author: userId })
    .sort({ createdAt: -1 })
    .populate({
      path: "question",
      populate: [
        { path: "author", select: "name image" },
        { path: "tags", select: "name" },
      ],
    })
    .lean()

  const questions = JSON.parse(
    JSON.stringify(
      savedCollections
        .map((savedCollection) => savedCollection.question)
        .filter(Boolean)
    )
  ) as QuestionType[]

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Saved Questions</h1>
      <DataRender
        success
        data={questions}
        empty={EMPTY_COLLECTIONS}
        render={(savedQuestions) => (
          <div className="mt-10 flex w-full flex-col gap-6">
            {savedQuestions.map((question) => (
              <QuestionCard key={question._id} question={question} />
            ))}
          </div>
        )}
      />
    </>
  )
}

export default CollectionPage
