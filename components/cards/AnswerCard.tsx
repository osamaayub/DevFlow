import Link from "next/link";
import { Suspense } from "react";

import { Preview } from "@/components/editor/preview"
import ROUTES from "@/constants/route";
import { cn } from "@/lib";

import  { RelativeTime, UserAvatar } from "../shared";

interface Props extends Answer {
  containerClasses?: string;
  showReadMore?: boolean;
  showActionBtns?: boolean;
}

const AnswerCard = ({
  _id,
  author,
  content,
  createdAt,
  question,
  containerClasses,
  showReadMore = false,
  showActionBtns = false,
}: Props) => {
  return (
    <article
      className={cn("light-border border-b py-10 relative", containerClasses)}
    >
      <span id={`answer-${_id}`} className="hash-span" />

      {showActionBtns && (
        <div className="background-light800 flex-center absolute -right-2 -top-5 size-9 rounded-full">
          {/* <EditDeleteAction type="Answer" itemId={_id} /> */}
        </div>
      )}

      <div className="mb-5 flex flex-col-reverse justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
        <div className="flex flex-1 items-start gap-1 sm:items-center">
          <UserAvatar
            id={author?._id}
            name={author?.name}
            image={author?.image}
            className="size-5 rounded-full object-cover max-sm:mt-2"
          />

          <Link
            href={ROUTES.PROFILE(author?._id ?? "")}
            className="flex flex-col max-sm:ml-1 sm:flex-row sm:items-center"
          >
            <p className="body-semibold text-dark300_light700">
              {author?.name}
            </p>

            <p className="small-regular text-light400_light500 ml-0.5 mt-0.5 line-clamp-1">
              <span className="max-sm:hidden"> • </span>
              answered <RelativeTime date={createdAt} />
            </p>
          </Link>
        </div>

        <div className="flex justify-end">
          <Suspense fallback={<div>Loading...</div>}>
          </Suspense>
        </div>
      </div>

      <Preview content={content} />

      {showReadMore && (
        <Link
          href={`/questions/${question}#answer-${_id}`}
          className="body-semibold relative z-10 font-space-grotesk text-primary-500"
        >
          <p className="mt-1">Read more...</p>
        </Link>
      )}
    </article>
  );
};

export default AnswerCard;