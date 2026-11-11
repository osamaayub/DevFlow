import { redirect } from "next/navigation"
import { Suspense } from "react"

import { AdminUsersContent } from "@/features/users/components/AdminUsersContent"
import { isAdminEmail } from "@/server/admin-access"
import { auth } from "@/server/auth"
import Routes from "@/shared/constants/route"

type AdminUsersPageProps = {
  searchParams: Promise<{ query?: string | string[] }>
}

async function AdminUsersResults({ searchParams }: AdminUsersPageProps) {
  const params = await searchParams
  const query = typeof params.query === "string" ? params.query : ""
  return <AdminUsersContent query={query} />
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const session = await auth()
  if (!isAdminEmail(session?.user?.email)) redirect(Routes.HOME)

  return (
    <Suspense
      fallback={
        <main className="w-full">
          <h1 className="h1-bold text-dark100_light900">User Management</h1>
          <div className="mt-8 h-64 animate-pulse rounded-xl bg-light-800 dark:bg-dark-300" />
        </main>
      }
    >
      <AdminUsersResults searchParams={searchParams} />
    </Suspense>
  )
}
