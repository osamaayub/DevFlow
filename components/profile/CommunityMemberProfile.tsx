import Image from "next/image"

import { QuestionCard } from "@/components/cards"
import { BackButton, UserAvatar } from "@/components/shared"
import ROUTES from "@/constants/route"
import { IUser } from "@/database"
import { Question } from "@/types"

interface Props {
  user: IUser
  questions: Question[]
}

const CommunityMemberProfile = ({ user, questions }: Props) => (
  <>
    <BackButton href={ROUTES.COMMUNITY} />

    <section className="card-wrapper mt-4 flex flex-col gap-6 rounded-2xl p-8 sm:flex-row sm:items-center sm:p-10">
      <UserAvatar
        id={user._id}
        name={user.name}
        image={user.image}
        disableLink
        className="size-24 shrink-0 rounded-full object-cover"
        fallbackClassName="text-3xl"
      />

      <div className="min-w-0">
        <h1 className="h1-bold text-dark100_light900">{user.name}</h1>
        <p className="body-regular mt-1 text-dark500_light500">
          @{user.username}
        </p>
        {user.bio && (
          <p className="body-regular mt-4 whitespace-pre-wrap text-dark200_light900">
            {user.bio}
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-dark400_light700">
          {typeof user.reputation === "number" && (
            <p>{user.reputation} reputation</p>
          )}
          {user.location && (
            <p className="flex items-center gap-2">
              <Image
                src="/icons/location.svg"
                alt=""
                width={18}
                height={18}
                className="invert-colors"
              />
              {user.location}
            </p>
          )}
          {user.joinedAt && (
            <p>Joined {new Date(user.joinedAt).toLocaleDateString()}</p>
          )}
          {user.portfolio && (
            <a
              href={user.portfolio}
              target="_blank"
              rel="noreferrer"
              className="text-primary-500 hover:underline"
            >
              Portfolio
            </a>
          )}
        </div>
      </div>
    </section>

    <section className="mt-10">
      <h2 className="h2-bold text-dark200_light900">
        Questions by {user.name}
      </h2>
      {questions.length > 0 ? (
        <div className="mt-6 flex flex-col gap-6">
          {questions.map((question) => (
            <QuestionCard key={question._id} question={question} />
          ))}
        </div>
      ) : (
        <p className="body-regular mt-5 text-dark400_light700">
          This community member hasn&apos;t asked any questions yet.
        </p>
      )}
    </section>
  </>
)

export default CommunityMemberProfile
