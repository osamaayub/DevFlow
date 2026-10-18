import { revalidatePath, revalidateTag } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

import { insertQuestion } from "@/features/questions/service"
import { auth } from "@/server/auth"
import { CACHE_TAGS } from "@/server/cache-tags"
import { HandleError } from "@/server/errors/error-handler"
import { UnauthorizedError, ValidationError } from "@/server/errors/http-error"
import ROUTES from "@/shared/constants/route"
import { AskQuestionSchema } from "@/shared/lib/validation"
import type { APIErrorResponse } from "@/shared/types"

/**
 * POST /api/questions
 * Creates a question as the signed-in user (send the `authjs.session-token` cookie).
 * Body: { "title": string, "content": string (Markdown), "tags": string[] }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) throw new UnauthorizedError("Sign in to post a question.")

    const body: unknown = await request.json().catch(() => {
      throw new ValidationError({ body: ["Request body must be valid JSON."] })
    })

    const parsed = AskQuestionSchema.safeParse(body)
    if (!parsed.success) {
      throw new ValidationError(parsed.error.flatten().fieldErrors as Record<string, string[]>)
    }

    const question = await insertQuestion({ ...parsed.data, authorId: userId })

    // updateTag only works in Server Actions; expire immediately so lists show the question
    revalidateTag(CACHE_TAGS.questions, { expire: 0 })
    revalidateTag(CACHE_TAGS.tags, { expire: 0 })
    revalidatePath(ROUTES.PROFILE(userId))

    return NextResponse.json({ success: true, data: question }, { status: 201 })
  } catch (error) {
    return HandleError(
      error instanceof Error ? error : String(error),
      "api"
    ) as unknown as APIErrorResponse
  }
}
