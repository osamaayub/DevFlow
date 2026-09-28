import { UserCard } from "@/components/cards"
import CommonFilter from "@/components/filters/CommonFilters"
import { Pagination } from "@/components/navigation"
import LocalSearchBar from "@/components/search/LocalSearchBar"
import { DataRender } from "@/components/shared"
import { communityFilters } from "@/constants/filter" // Added import for your filter constants
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
    <div>
      <h1 className="h1-bold text-dark100_light900">All Users</h1>

      <div className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearchBar
          route={ROUTES.COMMUNITY}
          imgSrc="/icons/search.svg"
          placeholder="Search by Username..."
          otherClasses="flex-1"
        />

        <CommonFilter
          filters={communityFilters}
          otherClasses="min-h-[56px] sm:min-w-[170px]"
        />
      </div>

      <DataRender
        success={success}
        data={users}
        empty={EMPTY_USERS}
        error={error}
        render={(users) => (
          <div className="mt-12 flex flex-wrap gap-5">
            {users.map((user: User) => (
              <UserCard key={user._id} {...user} />
            ))}
          </div>
        )}
      />

      <Pagination pageNumber={pageNumber} isNext={isNext || false} />
    </div>
  )
}

export default Community