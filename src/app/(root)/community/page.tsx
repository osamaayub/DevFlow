import { getUsers } from "@/features/community/actions"
import { UserCard } from "@/features/community/components"
import { BackButton, DataRender } from "@/shared/components/common"
import CommonFilter from "@/shared/components/filters/CommonFilters"
import { Pagination } from "@/shared/components/navigation"
import LocalSearchBar from "@/shared/components/search/LocalSearchBar"
import { communityFilters } from "@/shared/constants/filter"
import ROUTES from "@/shared/constants/route"
import { EMPTY_USERS } from "@/shared/constants/states"
import { RouteParams } from "@/shared/types"


const Community = async ({ searchParams }: RouteParams) => {
  const resolvedSearchParams = await searchParams
  const { page, pageSize, query, filter } = resolvedSearchParams || {}

const { success, data, error } = await getUsers({
  page: Number(page) || 1,
  pageSize: Number(pageSize) || 10,
  query: typeof query === "string" ? query : undefined,
  filter: typeof filter === "string" ? filter : undefined,
})

  const { users, isNext } = data || {}
  const pageNumber = Number(page) || 1

  return (
    <div>
      <div className="flex flex-col gap-2">
        <BackButton />
        <h1 className="h1-bold text-dark100_light900">All Users</h1>
      </div>

      <div className="mt-11 flex w-full items-stretch gap-5 max-sm:flex-col sm:flex-row sm:items-center">
        <LocalSearchBar
          route={ROUTES.COMMUNITY}
          imgSrc="/icons/search.svg"
          iconPosition="left"
          placeholder="Search by Username..."
          otherClasses="w-full flex-1"
        />

        <CommonFilter
          filters={communityFilters}
          defaultValue="popular"
          showFilterIcon
          otherClasses="min-h-[56px] w-full sm:w-[160px]"
        />
      </div>

      <DataRender
        success={success}
        data={users}
        empty={EMPTY_USERS}
        error={error}
        render={(users) => (
          <div className="mt-12 flex flex-wrap gap-5">
            {users.map((user) => (
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