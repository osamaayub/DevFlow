import Link from "next/link";

import { questions } from "@/constants/filter";
import { Routes } from "@/constants/route";
import { getTimeStamp } from "@/lib/utils";

import TagCards from "./TagCards";
import Metric from "../Metric";



interface Props {
  question: Question;
}


const QuestionCard = ({ question: { _id, title, author, answers, tags, views, createdAt } }: Props) => {
  return (
    <div className="card-wrapper rounded-[10px] p-9 sm:px-11">
      <div className="flex flex-col-reverse items-start justify-between gap-5 sm:flex-row">
        <div>
          <Link href={Routes.QUESTION(_id)}>
            <span
              className="subtle-regular text-dark400_light700 line-clamp-1 flex sm:hidden">{getTimeStamp(createdAt)}</span>
            <h3 className="sm:h3-semibold base-semibold text-dark200_light900 line-clamp-1 flex-1">{title}</h3>
          </Link>
        </div>
      </div>
      <div className="mt-3.5 flex w-full flex-wrap gap-2">
        {tags.map((tag: Tag) => (
          <TagCards key={tag._id} _id={tag._id} name={tag.name} compact />
        ))}
      </div>
      <div className="flex-between mt-6 w-full flex-wrap gap-3">
        <Metric imgUrl={author.image}
                value={author.name}
                alt={author.name} title={`${getTimeStamp(createdAt)}`} href={Routes.PROFILE(author._id)}
                textStyles="body-medium text-dark400_light700" isAuthor imgStyles={""} />


        <div className="flex items-center gap-3 max-sm:flex-wrap max-sm:justify-start">
          <Metric imgUrl={"/icons/like.svg"} alt="Like" value={questions[0].upvotes} title="votes"
                  textStyles="small-medium text-dark400_light800" href={""} imgStyles={""} />

          <Metric imgUrl={"/icons/message.svg"} alt="Answers" value={questions[0].answers} title="answers"
                  textStyles="small-medium text-dark400_light800" href={""} />


          <Metric imgUrl={"/icons/eye.svg"} alt="Views" value={questions[0].views} title="views"
                  textStyles="small-medium text-dark400_light800" href={""} />
        </div>
      </div>
    </div>

  );
};

export default QuestionCard;