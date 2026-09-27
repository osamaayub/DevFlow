import { UserCard } from "@/components/cards"
import { CommunityFilterDropdown } from "@/components/filters"
import { Pagination } from "@/components/navigation"
import LocalSearchBar from "@/components/search/LocalSearchBar"
import { DataRender } from "@/components/shared"
import ROUTES from "@/constants/route"
import { EMPTY_USERS } from "@/constants/states"
import { getUsers } from "@/lib/actions"

const Community = async ({ searchParams }: RouteParams) => {
  const { page, pageSize, query, filter } = await searchParams

  const { success, data, error } = await getUsers({
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
    query,
    filter
  })

  const { users, isNext } = data || {}
  const pageNumber = Number(page) || 1

  return (
    <>
      <h1 className="h1-bold text-dark100_light900 text-3xl">Community</h1>
      <section className="mt-11 flex gap-4 max-sm:flex-col sm:items-center">
        <LocalSearchBar
          route={ROUTES.COMMUNITY}
          imgSrc="/icons/search.svg"
          placeholder="Search by Username..."
          otherClasses="flex-1"
        />
        <CommunityFilterDropdown />
      </section>

      <DataRender
        success={success}
        data={users}
        empty={EMPTY_USERS}
        error={error}
        render={(users) => (
          <div className="mt-10 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {users.map((user: User) => (
              <UserCard key={user._id} {...user} />
            ))}
          </div>
        )}
      />

      <div className="mt-10">
        <Pagination pageNumber={pageNumber} isNext={isNext || false} />
      </div>
    </>
  )
}

export default Community