import { TagCards } from "@/features/tags/components"

interface Props {
  tags: Array<{ _id: string; name: string; count: number }>
}

const UserTopTags = ({ tags }: Props) => (
  <section className="mt-8 min-w-0 sm:mt-10">
    <h4 className="h3-semibold text-dark200_light900">Top Tags</h4>

    {tags.length > 0 ? (
      <div className="mt-5 flex flex-col gap-4">
        {tags.map((tag) => (
          <TagCards
            key={tag._id}
            _id={tag._id}
            name={tag.name}
            questions={tag.count}
            showCount
            compact
          />
        ))}
      </div>
    ) : (
      <p className="body-regular mt-5 text-dark400_light700">No tags yet.</p>
    )}
  </section>
)

export default UserTopTags
