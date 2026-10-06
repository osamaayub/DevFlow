import { TagCards } from "@/components/cards"
import LocalSearchBar from "@/components/search/LocalSearchBar"
import { DataRender } from "@/components/shared"
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

  const { tags } = data || {}

  return (
    <>
      <h1 className="h1-bold text-dark100_light900 text-3xl">Tags</h1>
      
      <section className="mt-11">
        <LocalSearchBar
          route={ROUTES.TAGS}
          imgSrc="/icons/search.svg"
          placeholder="Search By Tag Name..."
          otherClasses="flex-1"
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
    </>
  )
}

export default Tags