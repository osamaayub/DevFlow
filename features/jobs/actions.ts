"use server"

import type { FilterQuery, PipelineStage } from "mongoose"
import mongoose from "mongoose"
import { revalidatePath, unstable_cache, updateTag } from "next/cache"
import { z } from "zod"

import type { Job, JobApplicant } from "@/features/jobs/types"
import { canManageJob } from "@/features/jobs/utils"
import { action } from "@/server/action"
import { auth } from "@/server/auth"
import {
  Job as JobModel,
  JobApplication,
  parseSalaryRange,
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
  EditJobSchema,
  GetJobSchema,
  paginatedSearchParamsSchema,
  UpdateApplicationStatusSchema,
} from "@/shared/lib/validation"
import {
  ActionResponse,
  ApplyJobParams,
  CreateJobParams,
  EditJobParams,
  ErrorResponse,
  GetJobParams,
  GetJobsParams,
  PaginatedSearchParams,
  UpdateApplicationStatusParams,
} from "@/shared/types"

// Server actions are public endpoints, so page sizes are capped to keep queries bounded
const MAX_PAGE_SIZE = 50
const boundedPageSchema = z.object({
  page: z.number().int().positive().max(10_000).default(1),
  pageSize: z.number().int().positive().max(MAX_PAGE_SIZE).default(10),
})

const jobSearchParamsSchema = paginatedSearchParamsSchema.merge(boundedPageSchema).extend({
  location: z.string().max(100).optional(),
  category: z.string().max(100).optional(),
  query: z.string().max(100).optional(),
})

const jobApplicantsParamsSchema = GetJobSchema.merge(boundedPageSchema)

const JOB_FILTERS_TAG = "job-filter-options"

// Job cards only show two lines of description, so lists never ship the full text
const JOB_LIST_PROJECTION = {
  title: 1,
  company: 1,
  companyLogo: 1,
  category: 1,
  employmentType: 1,
  salaryRange: 1,
  location: 1,
  postedDate: 1,
  description: { $substrCP: [{ $ifNull: ["$description", ""] }, 0, 300] },
} as const

type JobSortCriteria = Record<string, 1 | -1>

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

const getJobSortCriteria = (filter?: string): JobSortCriteria => {
  switch (filter) {
    case "oldest":
      return { postedDate: 1, _id: 1 }
    case "salary-high":
      return { salaryMax: -1, _id: -1 }
    case "salary-low":
      return { salaryMin: 1, _id: 1 }
    case "recent":
    default:
      return { postedDate: -1, _id: -1 }
  }
}

const isDuplicateKeyError = (error: unknown) =>
  typeof error === "object" && error !== null && "code" in error && error.code === 11000

const handleActionError = (error: unknown): ErrorResponse =>
  HandleError(error instanceof Error ? error : new Error(String(error))) as unknown as ErrorResponse

// Jobs created before salaryMin/salaryMax existed get them filled in once per server process
let salaryBackfill: Promise<void> | null = null
const ensureSalaryFields = () => {
  salaryBackfill ??= (async () => {
    const legacyJobs = await JobModel.find({ salaryMin: { $exists: false } })
      .select("salaryRange")
      .lean<Array<{ _id: mongoose.Types.ObjectId; salaryRange: string }>>()

    if (legacyJobs.length === 0) return

    await JobModel.bulkWrite(
      legacyJobs.map(({ _id, salaryRange }) => ({
        updateOne: {
          filter: { _id },
          update: { $set: parseSalaryRange(salaryRange ?? "") },
        },
      }))
    )
  })().catch((error) => {
    salaryBackfill = null
    throw error
  })

  return salaryBackfill
}

// Dropdown options change only when a job is posted, so they are cached instead of
// running two full-collection distinct() scans on every page view
const getJobFilterOptions = unstable_cache(
  async () => {
    await dbConnect()
    const [categories, locations] = await Promise.all([
      JobModel.distinct("category"),
      JobModel.distinct("location"),
    ])

    return {
      categories: (categories as string[]).filter(Boolean).sort((a, b) => a.localeCompare(b)),
      locations: (locations as string[]).filter(Boolean).sort((a, b) => a.localeCompare(b)),
    }
  },
  [JOB_FILTERS_TAG],
  { tags: [JOB_FILTERS_TAG], revalidate: 3600 }
)

const toPlain = <T>(value: unknown) => JSON.parse(JSON.stringify(value)) as T

export async function getJobs(
  params: GetJobsParams
): Promise<
  ActionResponse<{
    jobs: Job[]
    isNext: boolean
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

  // Location and category values come from the dropdown, so exact matches can use indexes
  if (location?.trim()) filterQuery.location = location.trim()
  if (category?.trim()) filterQuery.category = category.trim()

  try {
    if (filter === "salary-high" || filter === "salary-low") await ensureSalaryFields()

    const pipeline: PipelineStage[] = [
      { $match: filterQuery },
      { $sort: getJobSortCriteria(filter) },
      { $skip: skip },
      // One extra row tells us whether there is a next page without a separate count query
      { $limit: pageSize + 1 },
      { $project: JOB_LIST_PROJECTION },
    ]

    const [results, filterOptions] = await Promise.all([
      JobModel.aggregate(pipeline),
      getJobFilterOptions(),
    ])

    return {
      success: true,
      data: toPlain({
        jobs: results.slice(0, pageSize),
        isNext: results.length > pageSize,
        ...filterOptions,
      }),
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
    const job = await JobModel.findById(validationResult.validatedData.jobId)
      .select("-__v -salaryMin -salaryMax")
      .lean()

    return {
      success: true,
      data: toPlain({ job }),
    }
  } catch (error) {
    return handleActionError(error)
  }
}

// Loads the signed-in user's relationship to a job in one round trip, so the
// details page can render Apply/Save state on the server instead of the client
export async function getJobViewerState(
  params: GetJobParams
): Promise<ActionResponse<{ applied: boolean; saved: boolean }>> {
  const validationResult = await action({
    params,
    schema: GetJobSchema,
  })

  if (validationResult instanceof Error) return handleActionError(validationResult)

  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return { success: true, data: { applied: false, saved: false } }

  const { jobId } = validationResult.validatedData

  try {
    const [applied, saved] = await Promise.all([
      JobApplication.exists({ job: jobId, applicant: userId }),
      SavedJob.exists({ job: jobId, author: userId }),
    ])

    return { success: true, data: { applied: Boolean(applied), saved: Boolean(saved) } }
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

  try {
    // The unique (author, job) index makes this safe without a transaction
    const removed = await SavedJob.findOneAndDelete({ job: jobId, author: userId })
    let saved = false

    if (!removed) {
      if (!(await JobModel.exists({ _id: jobId }))) throw new NotFoundError()

      try {
        await SavedJob.create({ job: jobId, author: userId })
      } catch (error) {
        if (!isDuplicateKeyError(error)) throw error
      }
      saved = true
    }

    revalidatePath(ROUTES.JOBS_DETAILS(jobId))
    return { success: true, data: { saved } }
  } catch (error) {
    return handleActionError(error)
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

    // The unique (applicant, job) index rejects duplicates, so no pre-check query is needed
    await JobApplication.create({
      job: jobId,
      applicant: applicantId,
      ...application,
    })

    revalidatePath(ROUTES.JOBS_DETAILS(jobId))
    return {
      success: true,
      data: { applied: true, alreadyApplied: false },
    }
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return {
        success: true,
        data: { applied: true, alreadyApplied: true },
      }
    }

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

    updateTag(JOB_FILTERS_TAG)
    revalidatePath(ROUTES.JOBS)
    return {
      success: true,
      data: toPlain({ job }),
    }
  } catch (error) {
    return handleActionError(error)
  }
}

export async function editJob(
  params: EditJobParams
): Promise<ActionResponse<{ job: Job }>> {
  const validationResult = await action({
    params,
    schema: EditJobSchema,
    authorize: true,
  })

  if (validationResult instanceof Error) return handleActionError(validationResult)

  const userId = validationResult.session?.user?.id
  if (!userId) return handleActionError(new UnauthorizedError())

  const { jobId, ...updates } = validationResult.validatedData

  try {
    const job = await JobModel.findById(jobId)
    if (!job) throw new NotFoundError()
    if (!canManageJob(job.postedBy, userId)) throw new ForbiddenError()

    // save() rather than updateOne() so the pre-save hook keeps salaryMin/salaryMax in sync
    job.set(updates)
    await job.save()

    updateTag(JOB_FILTERS_TAG)
    revalidatePath(ROUTES.JOBS)
    revalidatePath(ROUTES.JOBS_DETAILS(jobId))
    return {
      success: true,
      data: toPlain({ job }),
    }
  } catch (error) {
    return handleActionError(error)
  }
}

export async function deleteJob(
  params: GetJobParams
): Promise<ActionResponse<{ deleted: boolean }>> {
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
    const job = await JobModel.findById(jobId).select("postedBy").lean<Pick<IJob, "postedBy">>()
    if (!job) throw new NotFoundError()
    if (!canManageJob(job.postedBy, userId)) throw new ForbiddenError()

    // Remove the job first so no new applications or saves can attach to it, then clean up
    await JobModel.deleteOne({ _id: jobId })
    await Promise.all([
      JobApplication.deleteMany({ job: jobId }),
      SavedJob.deleteMany({ job: jobId }),
    ])

    updateTag(JOB_FILTERS_TAG)
    revalidatePath(ROUTES.JOBS)
    revalidatePath(ROUTES.JOBS_DETAILS(jobId))
    return { success: true, data: { deleted: true } }
  } catch (error) {
    return handleActionError(error)
  }
}

export async function getJobApplicants(
  params: GetJobParams & Partial<Pick<PaginatedSearchParams, "page" | "pageSize">>
): Promise<
  ActionResponse<{ job: Job; applicants: JobApplicant[]; totalApplicants: number; isNext: boolean }>
> {
  const validationResult = await action({
    params: { pageSize: 20, ...params },
    schema: jobApplicantsParamsSchema,
    authorize: true,
  })

  if (validationResult instanceof Error) return handleActionError(validationResult)

  const userId = validationResult.session?.user?.id
  if (!userId) return handleActionError(new UnauthorizedError())

  const { jobId, page = 1, pageSize = 20 } = validationResult.validatedData
  const skip = (page - 1) * pageSize

  try {
    const job = await JobModel.findById(jobId)
      .select("title company postedBy")
      .lean<Pick<IJob, "title" | "company" | "postedBy"> & { _id: mongoose.Types.ObjectId }>()
    if (!job) throw new NotFoundError()
    if (String(job.postedBy) !== String(userId)) throw new ForbiddenError()

    const [totalApplicants, applicants] = await Promise.all([
      JobApplication.countDocuments({ job: jobId }),
      JobApplication.find({ job: jobId })
        .sort({ appliedAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .select("applicantName applicantEmail phone resumeUrl portfolioUrl coverLetter status appliedAt")
        .lean(),
    ])

    return {
      success: true,
      data: toPlain({
        job,
        applicants,
        totalApplicants,
        isNext: totalApplicants > skip + applicants.length,
      }),
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
      .select("job")
      .lean<{ _id: mongoose.Types.ObjectId; job: mongoose.Types.ObjectId }>()
    if (!application) throw new NotFoundError()

    const isJobOwner = await JobModel.exists({ _id: application.job, postedBy: userId })
    if (!isJobOwner) throw new ForbiddenError()

    await JobApplication.updateOne({ _id: applicationId }, { $set: { status } })

    revalidatePath(ROUTES.JOBS_APPLICANTS(String(application.job)))
    return { success: true, data: { status } }
  } catch (error) {
    return handleActionError(error)
  }
}
