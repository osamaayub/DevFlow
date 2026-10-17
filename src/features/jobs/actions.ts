"use server"

import type { FilterQuery } from "mongoose"
import mongoose from "mongoose"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import type { Job } from "@/features/jobs/types"
import { action } from "@/server/action"
import {
  Job as JobModel,
  JobApplication,
  SavedJob,
  type IJob,
} from "@/server/db"
import { dbConnect } from "@/server/db/connect"
import { HandleError } from "@/server/errors/error-handler"
import { NotFoundError, UnauthorizedError } from "@/server/errors/http-error"
import ROUTES from "@/shared/constants/route"
import { GetJobSchema, paginatedSearchParamsSchema } from "@/shared/lib/validation"
import {
  ActionResponse,
  ErrorResponse,
  GetJobParams,
  GetJobsParams,
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
  params: GetJobParams
): Promise<ActionResponse<{ applied: boolean; alreadyApplied: boolean }>> {
  const validationResult = await action({
    params,
    schema: GetJobSchema,
    authorize: true,
  })

  if (validationResult instanceof Error) return handleActionError(validationResult)

  const { jobId } = validationResult.validatedData
  const applicant = validationResult.session?.user
  const applicantId = applicant?.id
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
      applicantName: applicant.name || "DevFlow member",
      applicantEmail: applicant.email || "",
    })

    revalidatePath(ROUTES.JOBS_DETAILS(jobId))
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
