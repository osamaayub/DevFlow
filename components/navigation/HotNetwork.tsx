import Image from "next/image"
import Link from "next/link"

import ROUTES from "@/constants/route"
import type { Question } from "@/types"

interface Props {
  questions: Question[]
  error?: string
}

const HotNetwork = ({ questions, error }: Props) => (
  <div>
    <h3 className="h3-bold text-dark200_light900">Hot Network</h3>

    {questions.length > 0 ? (
      <ul className="mt-7 flex w-full flex-col gap-6">
        {questions.map((question, index) => (
          <li key={question._id}>
            <Link
              href={ROUTES.QUESTION(question._id)}
              className="flex cursor-pointer items-start gap-3"
            >
              <span
                className={`mt-0.5 flex size-5.5 shrink-0 items-center justify-center rounded-[5px] border text-xs font-bold leading-none ${
                  index % 2 === 0
                    ? "border-primary-500 bg-primary-500/10 text-primary-500"
                    : "border-link-100 bg-link-100/10 text-link-100"
                }`}
              >
                ?
              </span>
              <p className="body-medium text-dark500_light700 line-clamp-2 transition-colors hover:text-primary-500">
                {question.title}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    ) : error ? (
      <p role="alert" className="mt-5 body-regular text-dark500_light700">
        {error}
      </p>
    ) : (
      <div className="mt-5 flex flex-col items-center gap-3 text-center">
        <Image
          src="/icons/question.svg"
          alt=""
          width={32}
          height={32}
          className="invert-colors"
        />
        <p className="body-regular text-dark500_light700">
          No questions available yet.
        </p>
      </div>
    )}
  </div>
)

export default HotNetwork
