import {Pagination} from "@/components/navigation"
import { DataRender } from "@/components/shared"
import { EMPTY_ANSWERS } from "@/constants/states"

import AnswerCard from "../cards/AnswerCard";


interface Props extends ActionResponse<Answer[]> {
  page: number;
  isNext: boolean;
  totalAnswers: number;
  answerVotes?: Record<string, "upvote" | "downvote">;
}

const AllAnswers = ({
  page,
  isNext,
  data,
  success,
  error,
  totalAnswers,
  answerVotes = {},
}: Props) => {
  return (
    <div className="mt-11">
      <div className="flex items-center justify-between">
        <h3 className="primary-text-gradient">
          {totalAnswers} {totalAnswers === 1 ? "Answer" : "Answers"}
        </h3>
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
              hasUpVoted={answerVotes[answer._id] === "upvote"}
              hasDownVoted={answerVotes[answer._id] === "downvote"}
            />
          ))
        }
      />

      <Pagination pageNumber={page} isNext={isNext} />
    </div>
  );
};

export default AllAnswers;