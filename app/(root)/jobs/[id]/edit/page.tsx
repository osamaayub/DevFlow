import { notFound, redirect } from "next/navigation"

import { getJobById } from "@/features/jobs/actions"
import { JobForm } from "@/features/jobs/components"
import { canManageJob } from "@/features/jobs/utils"
import { auth } from "@/server/auth"
import { BackButton } from "@/shared/components/common"
import ROUTES from "@/shared/constants/route"
import { RouteParams } from "@/shared/types"

const EditJob = async ({ params }: RouteParams) => {
  const { id } = await params
  if (!id) return notFound()

  const session = await auth()
  if (!session?.user?.id) redirect(ROUTES.SIGN_IN)

  const { success, data } = await getJobById({ jobId: id })
  if (!success || !data?.job) return notFound()

  const job = data.job
  if (!canManageJob(job.postedBy, session.user.id)) {
    redirect(ROUTES.JOBS_DETAILS(id))
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <BackButton href={ROUTES.JOBS_DETAILS(id)} />

      <h1 className="h1-bold text-dark100_light900 mt-2">Edit Job</h1>
      <p className="body-regular text-dark400_light500 mt-2">
        Update the details of your posting. Existing applications are kept.
      </p>

      <section className="background-light900_dark200 light-border mt-8 rounded-2xl border p-5 sm:p-8">
        <JobForm job={job} isEdit />
      </section>
    </div>
  )
}

export default EditJob
