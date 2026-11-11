import "server-only"

import { auth } from "@/server/auth"

const getAdminEmails = () =>
  new Set(
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  )

export function isAdminEmail(email?: string | null) {
  return Boolean(email && getAdminEmails().has(email.trim().toLowerCase()))
}

export async function getAdminActorId() {
  const session = await auth()
  if (!session?.user?.id || !isAdminEmail(session.user.email)) return null
  return session.user.id
}
