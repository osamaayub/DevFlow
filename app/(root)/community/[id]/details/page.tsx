import { notFound } from "next/navigation"

import CommunityMemberProfile from "@/components/profile/CommunityMemberProfile"
import { getCommunityMember } from "@/lib/actions"
import { RouteParams } from "@/types"

const CommunityMemberDetailsPage = async ({ params }: RouteParams) => {
  const { id } = await params
  const result = await getCommunityMember({ userId: id })

  if (!result.success) {
    throw new Error(result.error?.message ?? "Failed to load community member")
  }

  const { user, questions } = result.data ?? { user: null, questions: [] }

  if (!user) notFound()

  return <CommunityMemberProfile user={user} questions={questions} />
}

export default CommunityMemberDetailsPage
