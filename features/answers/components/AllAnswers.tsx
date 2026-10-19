import { hasVoted } from "@/features/votes/actions"
import { DataRender } from "@/shared/components/common"
import CommonFilter from "@/shared/components/filters/CommonFilters"
import { Pagination } from "@/shared/components/navigation"
import { AnswerFilters } from "@/shared/constants/filter"
import { EMPTY_ANSWERS } from "@/shared/constants/states"
import { ActionResponse, Answer } from "@/shared/types"


import AnswerCard from "./AnswerCard"

interface Props extends ActionResponse<Answer[]> {
  page: number
  isNext: boolean
  totalAnswers: number
}

const AllAnswers = ({
  page,
  isNext,
  data,
  success,
  error,
  totalAnswers
}: Props) => {
  return (
    <div className="mt-11">
      <div className="flex w-full items-center justify-between max-sm:flex-col">
        <h3 className="primary-text-gradient">
          {totalAnswers} {totalAnswers === 1 ? "Answer" : "Answers"}
        </h3>

        <CommonFilter
          filters={AnswerFilters}
          defaultValue="latest"
          showFilterIcon
          containerClasses="relative z-20 max-xs:w-full"
          otherClasses="min-h-[56px] w-full sm:min-w-[170px]"
        />
      </div>

      <DataRender
        data={data}
        error={error}
        success={success}
        empty={EMPTY_ANSWERS}
        render={(answers) =>
          answers.map((answer) => (
            <AnswerCard
              key={answer._id}
              {...answer}
              hasVotedPromise={hasVoted({
                targetId: answer._id,
                targetType: "answer"
              })}
            />
          ))
        }
      />

      <Pagination pageNumber={page} isNext={isNext} />
    </div>
  )
}

export default AllAnswers