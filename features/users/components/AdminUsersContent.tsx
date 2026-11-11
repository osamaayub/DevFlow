import Link from "next/link"

import { getManagedUsers } from "@/features/users/admin-actions"
import { AdminUserRow } from "@/features/users/components/AdminUserRow"

export async function AdminUsersContent({ query }: { query: string }) {
  const result = await getManagedUsers(query)

  return (
    <main className="w-full">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="small-semibold uppercase tracking-wide text-primary-500">Administration</p>
          <h1 className="h1-bold text-dark100_light900">User Management</h1>
          <p className="body-regular mt-1 text-dark500_light400">
            Search accounts, update profile details, and manage account access.
          </p>
        </div>
        <Link href="/" className="small-medium text-dark500_light400 hover:text-primary-500">
          Back to DevFlow
        </Link>
      </div>

      <form method="get" className="mt-7 flex flex-col gap-3 sm:flex-row">
        <label htmlFor="admin-user-query" className="sr-only">
          Search users
        </label>
        <input
          id="admin-user-query"
          name="query"
          type="search"
          defaultValue={query}
          maxLength={100}
          placeholder="Search name, username, or email"
          className="background-light900_dark300 light-border-2 text-dark300_light700 min-h-11 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        />
        <button
          type="submit"
          className="primary-gradient min-h-11 rounded-md px-6 text-sm font-semibold text-white"
        >
          Search
        </button>
      </form>

      {!result.success ? (
        <p role="alert" className="mt-6 rounded-lg border border-red-300 p-4 text-sm text-red-600">
          {result.error}
        </p>
      ) : result.data?.length ? (
        <>
          <p className="small-regular mt-5 text-dark500_light400">
            {result.data.length === 100
              ? "Showing the 100 most recently created matching accounts."
              : `${result.data.length} account${result.data.length === 1 ? "" : "s"} found.`}
          </p>
          <div className="mt-4 flex flex-col gap-4">
            {result.data.map((user) => (
              <AdminUserRow key={user._id} user={user} />
            ))}
          </div>
        </>
      ) : (
        <p className="mt-6 rounded-lg border border-light-700 p-6 text-center body-regular text-dark500_light400">
          No users match this search.
        </p>
      )}
    </main>
  )
}
