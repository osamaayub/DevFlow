import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { getCommunityMember } from "@/features/community/actions"
import { CommunityMemberProfile } from "@/features/community/components"
import { QUESTIONS_PER_PAGE } from "@/shared/constants/pagination"
import { getSiteUrl } from "@/shared/lib/seo"
import { RouteParams } from "@/shared/types"

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { id } = await params
  const result = await getCommunityMember({ userId: id, page: 1, pageSize: 1 })
  const user = result.success ? result.data?.user : undefined
  if (!user) return { title: "Community member not found", robots: { index: false, follow: false } }

  const title = `${user.name} | DevFlow Community`
  const description = `See ${user.name}'s contributions and programming activity in the DevFlow community.`
  return {
    title,
    description,
    alternates: { canonical: `${getSiteUrl()}/community/${id}/details` },
    openGraph: { type: "profile", title, description },
    twitter: { card: "summary", title, description }
  }
}

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
      isNext={isNext}
    />
  )
}

export default CommunityMemberDetailsPage
