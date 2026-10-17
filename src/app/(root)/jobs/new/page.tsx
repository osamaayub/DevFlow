import { redirect } from "next/navigation"

import { JobForm } from "@/features/jobs/components"
import { auth } from "@/server/auth"
import { BackButton } from "@/shared/components/common"
import ROUTES from "@/shared/constants/route"

const PostJob = async () => {
  const session = await auth()
  if (!session?.user?.id) redirect(ROUTES.SIGN_IN)

  return (
    <div className="mx-auto w-full max-w-4xl">
      <BackButton href={ROUTES.JOBS} />

      <h1 className="h1-bold text-dark100_light900 mt-2">Post a Job</h1>
      <p className="body-regular text-dark400_light500 mt-2">
        Share an opening with the DevFlow community. Applications will appear under My Jobs → Posted.
      </p>

      <section className="background-light900_dark200 light-border mt-8 rounded-2xl border p-5 sm:p-8">
        <JobForm />
      </section>
    </div>
  )
}

export default PostJob
