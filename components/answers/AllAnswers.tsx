import CommonFilter from "@/components/filters/CommonFilters"
import { Pagination } from "@/components/navigation"
import { DataRender } from "@/components/shared"
import { AnswerFilters } from "@/constants/filter"
import { EMPTY_ANSWERS } from "@/constants/states"
import { hasVoted } from "@/lib"
import { ActionResponse, Answer } from "@/types"


import AnswerCard from "../cards/AnswerCard"

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