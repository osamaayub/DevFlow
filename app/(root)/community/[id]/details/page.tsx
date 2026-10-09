import { notFound } from "next/navigation"

import CommunityMemberProfile from "@/components/profile/CommunityMemberProfile"
import { getCommunityMember } from "@/lib/actions"
import { RouteParams } from "@/types"

const CommunityMemberDetailsPage = async ({ params, searchParams }: RouteParams) => {
  const { id } = await params
  const { page, pageSize } = (await searchParams) || {}
  const pageNumber = Number(page) || 1
  const result = await getCommunityMember({
    userId: id,
    page: pageNumber,
    pageSize: Number(pageSize) || 10,
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
      isNext={isNext}
    />
  )
}

export default CommunityMemberDetailsPage
