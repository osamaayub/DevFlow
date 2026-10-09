import { Pagination } from "@/components"
import { TagCards } from "@/components/cards"
import CommonFilter from "@/components/filters/CommonFilters"
import LocalSearchBar from "@/components/search/LocalSearchBar"
import { BackButton, DataRender } from "@/components/shared"
import ROUTES from "@/constants/route"
import { EMPTY_TAGS } from "@/constants/states"
import { getTags } from "@/lib/actions"
import { RouteParams, Tag } from "@/types"

const Tags = async ({ searchParams }: RouteParams) => {
  const { page, pageSize, query, filter } = (await searchParams) || {}
  const pageNumber = Number(page) || 1

  const { success, data, error } = await getTags({
    page: pageNumber,
    pageSize: Number(pageSize) || 10,
    query: typeof query === "string" ? query : undefined,
    filter: typeof filter === "string" ? filter : undefined,
  })

  const { tags,isNext } = data || {}

  return (
    <>
      <div className="flex flex-col gap-2">
        <BackButton />
        <h1 className="h1-bold text-dark100_light900 text-3xl">Tags</h1>
      </div>
      
      <section className="mt-11 flex w-full justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearchBar
          route={ROUTES.TAGS}
          imgSrc="/icons/search.svg"
          placeholder="Search By Tag Name..."
          otherClasses="w-full flex-1"
        />
        <CommonFilter
          filters={[
            { name: "Most Popular", value: "popular" },
            { name: "Recently Created", value: "recent" },
            { name: "Oldest", value: "oldest" },
            { name: "Name", value: "name" },
          ]}
          defaultValue="popular"
          showFilterIcon
          otherClasses="min-h-[56px] w-full sm:min-w-[170px]"
        />
      </section>

      <DataRender
        success={success}
        data={tags as unknown as Tag[] | undefined}
        empty={EMPTY_TAGS}
        error={error}
        render={(tags: Tag[]) => (
          <div className="mt-10 flex w-full gap-4 flex-wrap">
            {tags.map((tag) => (
              <TagCards key={tag._id} {...tag} />
            ))}
          </div>
        )}
      />
      <Pagination pageNumber={Number(page)} isNext={isNext || false} />
    </>
  )
}

export default Tags