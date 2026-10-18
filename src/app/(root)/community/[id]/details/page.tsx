import { notFound } from "next/navigation"

import { getCommunityMember } from "@/features/community/actions"
import { CommunityMemberProfile } from "@/features/community/components"
import { QUESTIONS_PER_PAGE } from "@/shared/constants/pagination"
import { RouteParams } from "@/shared/types"

const CommunityMemberDetailsPage = async ({ params, searchParams }: RouteParams) => {
  const { id } = await params
  const { page, pageSize } = (await searchParams) || {}
  const pageNumber = Number(page) || 1
  const pageSizeNumber = Number(pageSize) || QUESTIONS_PER_PAGE
  const result = await getCommunityMember({
    userId: id,
    page: pageNumber,
    pageSize: pageSizeNumber,
  })

  if (!result.success) {
    throw new Error(result.error?.message ?? "Failed to load community member")
  }

  const { user, questions, isNext } = result.data ?? {
    user: null,
    questions: [],
    isNext: false,
  }

  if (!user) notFound()

  return (
    <CommunityMemberProfile
      user={user}
      questions={questions}
      pageNumber={pageNumber}
      pageSize={pageSizeNumber}
      isNext={isNext}
    />
  )
}

export default CommunityMemberDetailsPage
