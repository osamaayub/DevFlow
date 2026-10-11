import Image from "next/image"

import { formatNumber } from "@/shared/lib/utils"
import { Badges } from "@/shared/types"

interface Props {
  totalQuestions: number
  totalAnswers: number
  badges: Badges
}

const StatsCard = ({
  imgUrl,
  value,
  title,
}: {
  imgUrl: string
  value: number
  title: string
}) => (
  <div className="light-border background-light900_dark300 flex min-h-[72px] items-center justify-center gap-2 rounded-md border px-3 py-2 shadow-light-300 dark:shadow-dark-200">
    <Image
      src={imgUrl}
      alt=""
      aria-hidden="true"
      width={28}
      height={34}
      className="shrink-0 object-contain"
    />
    <div className="min-w-0">
      <p className="small-semibold text-dark200_light900">
        {formatNumber(value)}
      </p>
      <p className="small-regular whitespace-nowrap text-dark400_light700">
        {title}
      </p>
    </div>
  </div>
)

const Stats = ({ totalQuestions, totalAnswers, badges }: Props) => (
  <div className="mt-5">
    <h4 className="h3-semibold text-dark200_light900">Stats</h4>

    <div className="mt-4 grid grid-cols-1 gap-3 xs:grid-cols-2 lg:grid-cols-4">
      <div className="light-border background-light900_dark300 flex min-h-[72px] items-center justify-center gap-5 rounded-md border px-3 py-2 shadow-light-300 dark:shadow-dark-200">
        <div className="text-center">
          <p className="small-semibold text-dark200_light900">
            {formatNumber(totalQuestions)}
          </p>
          <p className="small-regular text-dark400_light700">Questions</p>
        </div>
        <div className="text-center">
          <p className="small-semibold text-dark200_light900">
            {formatNumber(totalAnswers)}
          </p>
          <p className="small-regular text-dark400_light700">Answers</p>
        </div>
      </div>

      <StatsCard
        imgUrl="/icons/gold-medal.svg"
        value={badges.GOLD}
        title="Gold Badges"
      />
      <StatsCard
        imgUrl="/icons/silver-medal.svg"
        value={badges.SILVER}
        title="Silver Badges"
      />
      <StatsCard
        imgUrl="/icons/bronze-medal.svg"
        value={badges.BRONZE}
        title="Bronze Badges"
      />
    </div>
  </div>
)

export default Stats
