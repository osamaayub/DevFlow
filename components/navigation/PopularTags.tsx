import { TagCards } from "@/components/cards"
import type { Question } from "@/types"

interface PopularTag {
  _id: string
  name: string
  count: number
}

interface Props {
  questions: Question[]
  error?: string
}

const getPopularTags = (questions: Question[]): PopularTag[] => {
  const tags = new Map<string, PopularTag>()

  for (const question of questions) {
    for (const tag of question.tags ?? []) {
      const existingTag = tags.get(tag._id)

      if (existingTag) {
        existingTag.count += 1
      } else {
        tags.set(tag._id, { _id: tag._id, name: tag.name, count: 1 })
      }
    }
  }

  return Array.from(tags.values())
    .sort((first, second) => second.count - first.count)
    .slice(0, 5)
}

const PopularTags = ({ questions, error }: Props) => {
  const tags = getPopularTags(questions)

  return (
    <div className="mt-6 border-t border-light-700 pt-6 dark:border-dark-400">
      <h3 className="h3-bold text-dark200_light900">Popular Tags</h3>
      <div className="mt-5 flex flex-col gap-3">
        {error ? (
          <p role="alert" className="body-regular text-dark500_light700">
            {error}
          </p>
        ) : tags.length > 0 ? (
          tags.map(({ _id, name, count }) => (
            <TagCards
              key={_id}
              _id={_id}
              name={name}
              questions={count}
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
}

export default PopularTags
