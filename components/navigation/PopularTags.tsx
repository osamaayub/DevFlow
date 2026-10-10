import { TagCards } from "@/components/cards"
import type { ITag } from "@/database"

interface Props {
  tags: ITag[]
  error?: string
}

const PopularTags = ({ tags, error }: Props) => (
  <div className="mt-6 border-t border-light-700 pt-6 dark:border-dark-400">
    <h3 className="h3-bold text-dark200_light900">Popular Tags</h3>
    <div className="mt-5 flex flex-col gap-3">
      {error ? (
        <p role="alert" className="body-regular text-dark500_light700">
          {error}
        </p>
      ) : tags.length > 0 ? (
        tags.map((tag) => (
          <TagCards
            key={tag._id}
            _id={tag._id}
            name={tag.name}
            questions={tag.questions}
            showCount
            compact
          />
        ))
      ) : (
        <p className="body-regular text-dark500_light700">
          No tags available yet.
        </p>
      )}
    </div>
  </div>
)

export default PopularTags
