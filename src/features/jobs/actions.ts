
"use server"

import type { FilterQuery } from "mongoose"
import mongoose from "mongoose"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import type {
  AppliedJob,
  Job,
  JobApplicant,
  PostedJob,
  SavedJobItem,
} from "@/features/jobs/types"
import { action } from "@/server/action"
import {
  Job as JobModel,
  JobApplication,
  SavedJob,
  type IJob,
} from "@/server/db"
import { dbConnect } from "@/server/db/connect"
import { HandleError } from "@/server/errors/error-handler"
import { ForbiddenError, NotFoundError, UnauthorizedError } from "@/server/errors/http-error"
import ROUTES from "@/shared/constants/route"
import {
  ApplyJobSchema,
  CreateJobSchema,
  GetJobSchema,
  paginatedSearchParamsSchema,
  UpdateApplicationStatusSchema,
} from "@/shared/lib/validation"
import {
  ActionResponse,
  ApplyJobParams,
  CreateJobParams,
  ErrorResponse,
  GetJobParams,
  GetJobsParams,
  PaginatedSearchParams,
  UpdateApplicationStatusParams,
} from "@/shared/types"

const jobSearchParamsSchema = paginatedSearchParamsSchema.extend({
  location: z.string().optional(),
  category: z.string().optional(),
})

type JobSortCriteria = Record<string, 1 | -1>

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

const getSalaryValue = (salaryRange: string, index: number) => {
  const value = salaryRange.split("-")[index]?.trim().toLowerCase() || "0"
  const amount = Number(value.match(/[\d,.]+/)?.[0]?.replaceAll(",", "") || 0)

  if (value.includes("m")) return amount * 1_000_000
  if (value.includes("k")) return amount * 1_000
  return amount
}

const getJobSortCriteria = (filter?: string): JobSortCriteria => {
  switch (filter) {
    case "oldest":
      return { postedDate: 1, _id: 1 }
    case "salary-high":
    case "salary-low":
      return {}
    case "recent":
    default:
      return { postedDate: -1, _id: -1 }
  }
}

const handleActionError = (error: unknown): ErrorResponse =>
  HandleError(error instanceof Error ? error : new Error(String(error))) as unknown as ErrorResponse

export async function getJobs(
  params: GetJobsParams
): Promise<
  ActionResponse<{
    jobs: Job[]
    isNext: boolean
    totalJobs: number
    categories: string[]
    locations: string[]
  }>
> {
  const validationResult = await action({
    params,
    schema: jobSearchParamsSchema,
  })

  if (validationResult instanceof Error) {
    return handleActionError(validationResult)
  }

  const {
    page = 1,
    pageSize = 10,
    query,
    filter,
    location,
    category,
  } = validationResult.validatedData
  const skip = (page - 1) * pageSize
  const filterQuery: FilterQuery<IJob> = {}

  if (query?.trim()) {
    const searchPattern = new RegExp(escapeRegex(query.trim()), "i")
    filterQuery.$or = [
      { title: searchPattern },
      { company: searchPattern },
      { category: searchPattern },
      { location: searchPattern },
    ]
  }

  if (location?.trim()) {
    filterQuery.location = {
      $regex: escapeRegex(location.trim()),
      $options: "i",
    }
  }

  if (category?.trim()) {
    filterQuery.category = {
      $regex: `^${escapeRegex(category.trim())}$`,
      $options: "i",
    }
  }

  try {
    const [totalJobs, matchingJobs, categories, locations] = await Promise.all([
      JobModel.countDocuments(filterQuery),
      JobModel.find(filterQuery)
        .sort(getJobSortCriteria(filter))
        .lean(),
      JobModel.distinct("category"),
      JobModel.distinct("location"),
    ])

    const sortedJobs =
      filter === "salary-high" || filter === "salary-low"
        ? matchingJobs.sort((a, b) => {
            const salaryDifference =
              getSalaryValue(a.salaryRange, filter === "salary-high" ? 1 : 0) -
              getSalaryValue(b.salaryRange, filter === "salary-high" ? 1 : 0)
            return filter === "salary-high" ? -salaryDifference : salaryDifference
          })
        : matchingJobs
    const jobs = sortedJobs.slice(skip, skip + pageSize)

    return {
      success: true,
      data: JSON.parse(
        JSON.stringify({
          jobs,
          isNext: totalJobs > skip + jobs.length,
          totalJobs,
          categories: categories.sort((a, b) => a.localeCompare(b)),
          locations: locations.sort((a, b) => a.localeCompare(b)),
        })
      ) as {
        jobs: Job[]
        isNext: boolean
        totalJobs: number
        categories: string[]
        locations: string[]
      },
    }
  } catch (error) {
    return handleActionError(error)
  }
}

export async function getJobById(
  params: GetJobParams
): Promise<ActionResponse<{ job: Job | null }>> {
  const validationResult = await action({
    params,
    schema: GetJobSchema,
  })

  if (validationResult instanceof Error) {
    return handleActionError(validationResult)
  }

  try {
    const job = await JobModel.findById(validationResult.validatedData.jobId).lean()

    return {
      success: true,
      data: JSON.parse(JSON.stringify({ job })) as { job: Job | null },
    }
  } catch (error) {
    return handleActionError(error)
  }
}

export async function hasSavedJob(
  params: GetJobParams
): Promise<ActionResponse<{ saved: boolean }>> {
  const validationResult = await action({
    params,
    schema: GetJobSchema,
    authorize: true,
  })

  if (validationResult instanceof Error) return handleActionError(validationResult)

  const userId = validationResult.session?.user?.id
  if (!userId) return handleActionError(new UnauthorizedError())

  try {
    const saved = await SavedJob.exists({
      job: validationResult.validatedData.jobId,
      author: userId,
    })

    return { success: true, data: { saved: Boolean(saved) } }
  } catch (error) {
    return handleActionError(error)
  }
}

export async function toggleSaveJob(
  params: GetJobParams
): Promise<ActionResponse<{ saved: boolean }>> {
  const validationResult = await action({
    params,
    schema: GetJobSchema,
    authorize: true,
  })

  if (validationResult instanceof Error) return handleActionError(validationResult)

  const { jobId } = validationResult.validatedData
  const userId = validationResult.session?.user?.id
  if (!userId) return handleActionError(new UnauthorizedError())

  await dbConnect()
  const mongoSession = await mongoose.startSession()

  try {
    if (!(await JobModel.exists({ _id: jobId }))) throw new NotFoundError()

    let saved = false
    await mongoSession.withTransaction(async () => {
      const removed = await SavedJob.findOneAndDelete(
        { job: jobId, author: userId },
        { session: mongoSession }
      )

      if (removed) {
        saved = false
        return
      }

      await SavedJob.create([{ job: jobId, author: userId }], {
        session: mongoSession,
      })
      saved = true
    })

    revalidatePath(ROUTES.JOBS)
    revalidatePath(ROUTES.JOBS_DETAILS(jobId))
    revalidatePath(ROUTES.MY_JOBS)
    return { success: true, data: { saved } }
  } catch (error) {
    return handleActionError(error)
  } finally {
    await mongoSession.endSession()
  }
}

export async function hasAppliedToJob(
  params: GetJobParams
): Promise<ActionResponse<{ applied: boolean }>> {
  const validationResult = await action({
    params,
    schema: GetJobSchema,
    authorize: true,
  })

  if (validationResult instanceof Error) return handleActionError(validationResult)

  const userId = validationResult.session?.user?.id
  if (!userId) return handleActionError(new UnauthorizedError())

  try {
    const applied = await JobApplication.exists({
      job: validationResult.validatedData.jobId,
      applicant: userId,
    })

    return { success: true, data: { applied: Boolean(applied) } }
  } catch (error) {
    return handleActionError(error)
  }
}

export async function applyToJob(
  params: ApplyJobParams
): Promise<ActionResponse<{ applied: boolean; alreadyApplied: boolean }>> {
  const validationResult = await action({
    params,
    schema: ApplyJobSchema,
    authorize: true,
  })

  if (validationResult instanceof Error) return handleActionError(validationResult)

  const { jobId, ...application } = validationResult.validatedData
  const applicantId = validationResult.session?.user?.id
  if (!applicantId) return handleActionError(new UnauthorizedError())

  try {
    if (!(await JobModel.exists({ _id: jobId }))) throw new NotFoundError()

    const existingApplication = await JobApplication.exists({
      job: jobId,
      applicant: applicantId,
    })

    if (existingApplication) {
      return {
        success: true,
        data: { applied: true, alreadyApplied: true },
      }
    }

    await JobApplication.create({
      job: jobId,
      applicant: applicantId,
      ...application,
    })

    revalidatePath(ROUTES.JOBS_DETAILS(jobId))
    revalidatePath(ROUTES.MY_JOBS)
    return {
      success: true,
      data: { applied: true, alreadyApplied: false },
    }
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      return {
        success: true,
        data: { applied: true, alreadyApplied: true },
      }
    }

    return handleActionError(error)
  }
}

const myJobsParamsSchema = paginatedSearchParamsSchema.pick({
  page: true,
  pageSize: true,
})

export async function getAppliedJobs(
  params: Pick<PaginatedSearchParams, "page" | "pageSize">
): Promise<ActionResponse<{ applications: AppliedJob[]; isNext: boolean }>> {
  const validationResult = await action({
    params,
    schema: myJobsParamsSchema,
    authorize: true,
  })

  if (validationResult instanceof Error) return handleActionError(validationResult)

  const userId = validationResult.session?.user?.id
  if (!userId) return handleActionError(new UnauthorizedError())

  const { page = 1, pageSize = 10 } = validationResult.validatedData
  const skip = (page - 1) * pageSize

  try {
    const [total, applications] = await Promise.all([
      JobApplication.countDocuments({ applicant: userId }),
      JobApplication.find({ applicant: userId })
        .sort({ appliedAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .populate("job")
        .lean(),
    ])

    const items = applications
      .filter((application) => application.job)
      .map(({ _id, job, status, appliedAt }) => ({ _id, job, status, appliedAt }))

    return {
      success: true,
      data: JSON.parse(
        JSON.stringify({
          applications: items,
          isNext: total > skip + applications.length,
        })
      ) as { applications: AppliedJob[]; isNext: boolean },
    }
  } catch (error) {
    return handleActionError(error)
  }
}

export async function getSavedJobs(
  params: Pick<PaginatedSearchParams, "page" | "pageSize">
): Promise<ActionResponse<{ savedJobs: SavedJobItem[]; isNext: boolean }>> {
  const validationResult = await action({
    params,
    schema: myJobsParamsSchema,
    authorize: true,
  })

  if (validationResult instanceof Error) return handleActionError(validationResult)

  const userId = validationResult.session?.user?.id
  if (!userId) return handleActionError(new UnauthorizedError())

  const { page = 1, pageSize = 10 } = validationResult.validatedData
  const skip = (page - 1) * pageSize

  try {
    const [total, savedJobs] = await Promise.all([
      SavedJob.countDocuments({ author: userId }),
      SavedJob.find({ author: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .populate("job")
        .lean(),
    ])

    const items = savedJobs
      .filter((savedJob) => savedJob.job)
      .map(({ _id, job, createdAt }) => ({ _id, job, savedAt: createdAt }))

    return {
      success: true,
      data: JSON.parse(
        JSON.stringify({
          savedJobs: items,
          isNext: total > skip + savedJobs.length,
        })
      ) as { savedJobs: SavedJobItem[]; isNext: boolean },
    }
  } catch (error) {
    return handleActionError(error)
  }
}

export async function createJob(
  params: CreateJobParams
): Promise<ActionResponse<{ job: Job }>> {
  const validationResult = await action({
    params,
    schema: CreateJobSchema,
    authorize: true,
  })

  if (validationResult instanceof Error) return handleActionError(validationResult)

  const userId = validationResult.session?.user?.id
  if (!userId) return handleActionError(new UnauthorizedError())

  try {
    const job = await JobModel.create({
      ...validationResult.validatedData,
      postedBy: userId,
      postedDate: new Date(),
    })

    revalidatePath(ROUTES.JOBS)
    revalidatePath(ROUTES.MY_JOBS)
    return {
      success: true,
      data: JSON.parse(JSON.stringify({ job })) as { job: Job },
    }
  } catch (error) {
    return handleActionError(error)
  }
}

export async function getPostedJobs(
  params: Pick<PaginatedSearchParams, "page" | "pageSize">
): Promise<ActionResponse<{ jobs: PostedJob[]; isNext: boolean }>> {
  const validationResult = await action({
    params,
    schema: myJobsParamsSchema,
    authorize: true,
  })

  if (validationResult instanceof Error) return handleActionError(validationResult)

  const userId = validationResult.session?.user?.id
  if (!userId) return handleActionError(new UnauthorizedError())

  const { page = 1, pageSize = 10 } = validationResult.validatedData
  const skip = (page - 1) * pageSize

  try {
    const [total, jobs] = await Promise.all([
      JobModel.countDocuments({ postedBy: userId }),
      JobModel.find({ postedBy: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
    ])

    const counts = await JobApplication.aggregate<{ _id: mongoose.Types.ObjectId; count: number }>([
      { $match: { job: { $in: jobs.map((job) => new mongoose.Types.ObjectId(String(job._id))) } } },
      { $group: { _id: "$job", count: { $sum: 1 } } },
    ])
    const countByJob = new Map(counts.map(({ _id, count }) => [String(_id), count]))

    return {
      success: true,
      data: JSON.parse(
        JSON.stringify({
          jobs: jobs.map((job) => ({
            ...job,
            applicantCount: countByJob.get(String(job._id)) ?? 0,
          })),
          isNext: total > skip + jobs.length,
        })
      ) as { jobs: PostedJob[]; isNext: boolean },
    }
  } catch (error) {
    return handleActionError(error)
  }
}

export async function getJobApplicants(
  params: GetJobParams
): Promise<ActionResponse<{ job: Job; applicants: JobApplicant[] }>> {
  const validationResult = await action({
    params,
    schema: GetJobSchema,
    authorize: true,
  })

  if (validationResult instanceof Error) return handleActionError(validationResult)

  const userId = validationResult.session?.user?.id
  if (!userId) return handleActionError(new UnauthorizedError())

  const { jobId } = validationResult.validatedData

  try {
    const job = await JobModel.findById(jobId).lean<IJob>()
    if (!job) throw new NotFoundError()
    if (String(job.postedBy) !== String(userId)) throw new ForbiddenError()

    const applicants = await JobApplication.find({ job: jobId })
      .sort({ appliedAt: -1 })
      .select("applicantName applicantEmail phone resumeUrl portfolioUrl coverLetter status appliedAt")
      .lean()

    return {
      success: true,
      data: JSON.parse(JSON.stringify({ job, applicants })) as {
        job: Job
        applicants: JobApplicant[]
      },
    }
  } catch (error) {
    return handleActionError(error)
  }
}

export async function updateApplicationStatus(
  params: UpdateApplicationStatusParams
): Promise<ActionResponse<{ status: UpdateApplicationStatusParams["status"] }>> {
  const validationResult = await action({
    params,
    schema: UpdateApplicationStatusSchema,
    authorize: true,
  })

  if (validationResult instanceof Error) return handleActionError(validationResult)

  const userId = validationResult.session?.user?.id
  if (!userId) return handleActionError(new UnauthorizedError())

  const { applicationId, status } = validationResult.validatedData

  try {
    const application = await JobApplication.findById(applicationId)
    if (!application) throw new NotFoundError()

    const isJobOwner = await JobModel.exists({ _id: application.job, postedBy: userId })
    if (!isJobOwner) throw new ForbiddenError()

    application.status = status
    await application.save()

    revalidatePath(ROUTES.JOBS_APPLICANTS(String(application.job)))
    revalidatePath(ROUTES.MY_JOBS)
    return { success: true, data: { status } }
  } catch (error) {
    return handleActionError(error)
  }
}

export async function withdrawApplication(
  params: GetJobParams
): Promise<ActionResponse<{ withdrawn: boolean }>> {
  const validationResult = await action({
    params,
    schema: GetJobSchema,
    authorize: true,
  })

  if (validationResult instanceof Error) return handleActionError(validationResult)

  const userId = validationResult.session?.user?.id
  if (!userId) return handleActionError(new UnauthorizedError())

  const { jobId } = validationResult.validatedData

  try {
    const removed = await JobApplication.findOneAndDelete({
      job: jobId,
      applicant: userId,
      status: { $in: ["submitted", "reviewing"] },
    })
    if (!removed) throw new NotFoundError()

    revalidatePath(ROUTES.MY_JOBS)
    revalidatePath(ROUTES.JOBS_DETAILS(jobId))
    revalidatePath(ROUTES.JOBS_APPLICANTS(jobId))
    return { success: true, data: { withdrawn: true } }
  } catch (error) {
    return handleActionError(error)
  }
}
