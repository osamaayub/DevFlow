import z from "zod"

import {InteractionActionEnums} from "@/server/db/schemas/Interaction.schema"

export const SignUpSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters."
  }),
  username: z.string().min(2, {
    message: "Username must be at least 2 characters."
  }),
  email: z.string().email({ message: "please Provide a Valid Email Address" }),
  password: z
    .string()
    .min(6, { message: "password must be least of 6 characters" })
    .max(10, { message: "password cannot exceed 10 characters" })
})
export const SignInSchema = z.object({
  email: z.string().email({ message: "please Provide a Valid Email Address" }).min(1),
  password: z
    .string()
    .min(6, { message: "Password must be of at least 6 characters" })
    .max(10, { message: "password cannot exceed 10 characters" })
})

export const AskQuestionSchema = z.object({
  title: z
    .string()
    .min(5, {
      message: "Title must be at least 5 characters."
    })
    .max(130, { message: "Title mustn't be longer then 130 characters." }),
  content: z.string().min(100, { message: "Minimum of 100 characters." }),
  tags: z
    .array(
      z
        .string()
        .min(1, { message: "Tag must have at least 1 character." })
        .max(15, { message: "Tag must not exceed 15 characters." })
    )
    .min(1, { message: "Add at least one tag." })
    .max(3, { message: "Maximum of 3 tags." })
})

export const UserSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters."
  }),
  username: z.string().min(2, {
    message: "Username must be at least 2 characters."
  }),
  email: z.string().email({ message: "please Provide a Valid Email Address" }),
  reputation: z.number().min(0, { message: "Reputation cannot be negative." }),
  bio: z.string().max(500, { message: "Bio cannot exceed 500 characters." }).optional(),
  location: z.string().max(100, { message: "Location cannot exceed 100 characters." }).optional(),
  portfolio: z.string().url({ message: "Portfolio must be a valid URL." }).optional(),
  image: z.string().url({ message: "Image must be a valid URL." }),
  joinedAt: z.date(),
  password: z
    .string()
    .min(6, { message: "password must be least of 6 characters" })
    .max(10, { message: "password cannot execede 10 characters" })
})

export const AccountUpdateSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters."
  }),
  image: z.string().url({ message: "Image must be a valid URL." }).optional(),
  password: z
    .string()
    .min(6, { message: "password must be least of 6 characters" })
    .max(10, { message: "password cannot execede 10 characters" })
    .optional(),
  userId: z.string().min(1, { message: "User ID is required." }),
  provider: z.string().min(1, { message: "Provider is required." }),
  providerAccountId: z.string().min(1, { message: "Provider Account ID is required." })
})
export const signInOauthSchema = z.object({
  provider: z.enum(["google", "github"]),
  providerAccountId: z.string().min(1, { message: "Provider Account ID is required." }),
  user: z.object({
    name: z.string().min(4, {
      message: "Name must be at least 4 characters."
    }),
    username: z.string().min(3, {
      message: "Username must be at least 3 characters."
    }),
    email: z.string().email({ message: "please Provide a Valid Email Address" })
  }),
  image: z.string().url({ message: "Image must be a valid URL." }).optional()
})

export const EditQuestionSchema = AskQuestionSchema.extend({
  questionId: z.string().min(1, { message: "QuestionId is required" })
})
export const GetQuestionSchema = z.object({
  questionId: z.string().min(1, { message: "QuestionId is required" })
})
export const DeleteQuestionSchema = z.object({
  questionId: z.string().regex(/^[0-9a-fA-F]{24}$/, { message: " Question ID is required" })
})
export const DeleteAnswerSchema=z.object({
  answerId: z.string().regex(/^[0-9a-fA-F]{24}$/, { message: " Answer ID is required" })
})
export const GetJobSchema = z.object({
  jobId: z.string().regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid job ID" })
})
export const JobApplicationFormSchema = z.object({
  applicantName: z.string().trim().min(2, { message: "Full name must be at least 2 characters." }),
  applicantEmail: z.string().trim().email({ message: "Please provide a valid email address." }),
  phone: z
    .string()
    .trim()
    .max(20, { message: "Phone number is too long." })
    .regex(/^[+()\-\s\d]*$/, { message: "Please provide a valid phone number." }),
  resumeUrl: z.string().trim().url({ message: "Please provide a valid link to your resume." }),
  portfolioUrl: z.union([
    z.literal(""),
    z.string().trim().url({ message: "Please provide a valid portfolio URL." }),
  ]),
  coverLetter: z
    .string()
    .trim()
    .min(50, { message: "Cover letter must be at least 50 characters." })
    .max(2000, { message: "Cover letter cannot exceed 2000 characters." }),
})
export const ApplyJobSchema = GetJobSchema.merge(JobApplicationFormSchema)
export const JOB_EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Internship", "Freelance"] as const
export const JOB_APPLICATION_STATUSES = ["submitted", "reviewing", "accepted", "rejected"] as const
export const CreateJobSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, { message: "Job title must be at least 3 characters." })
    .max(120, { message: "Job title cannot exceed 120 characters." }),
  company: z
    .string()
    .trim()
    .min(2, { message: "Company name must be at least 2 characters." })
    .max(80, { message: "Company name cannot exceed 80 characters." }),
  companyLogo: z.union([
    z.literal(""),
    z
      .string()
      .max(100_000, { message: "Logo image is too large. Please choose a smaller image." })
      .regex(/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/, {
        message: "Please upload a valid image.",
      }),
  ]),
  applicationUrl: z
    .string()
    .trim()
    .url({ message: "Please provide a valid official job URL." }),
  category: z
    .string()
    .trim()
    .min(2, { message: "Category must be at least 2 characters." })
    .max(40, { message: "Category cannot exceed 40 characters." }),
  employmentType: z.enum(JOB_EMPLOYMENT_TYPES, { message: "Please select an employment type." }),
  location: z
    .string()
    .trim()
    .min(2, { message: "Location must be at least 2 characters." })
    .max(80, { message: "Location cannot exceed 80 characters." }),
  salaryRange: z
    .string()
    .trim()
    .min(2, { message: "Please provide a salary range, e.g. 80k - 100k." })
    .max(50, { message: "Salary range cannot exceed 50 characters." }),
  description: z
    .string()
    .trim()
    .min(50, { message: "Description must be at least 50 characters." })
    .max(5000, { message: "Description cannot exceed 5000 characters." }),
})
export const EditJobSchema = GetJobSchema.merge(CreateJobSchema)
export const UpdateApplicationStatusSchema = z.object({
  applicationId: z.string().regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid application ID" }),
  status: z.enum(JOB_APPLICATION_STATUSES),
})
export const GetUserSchema = z.object({
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid user ID" })
})
export const GetUserActivityPageSchema = GetUserSchema.extend({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(10).default(3),
})
export const UpdateUserProfileSchema = z.object({
  name: z.string().trim().min(2, {
    message: "Name must be at least 2 characters."
  }),
  username: z.string().trim().min(2, {
    message: "Username must be at least 2 characters."
  }),
  bio: z.string().max(500, { message: "Bio cannot exceed 500 characters." }),
  location: z.string().max(100, {
    message: "Location cannot exceed 100 characters.",
  }),
  portfolio: z.union([
    z.literal(""),
    z.string().url({ message: "Portfolio must be a valid URL." }),
  ]),
})
export const GetCommunityMemberSchema = GetUserSchema.extend({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().default(10),
})

// Server actions are public endpoints, so list inputs are bounded
export const paginatedSearchParamsSchema = z.object({
  page: z.number().int().positive().max(10_000).default(1),
  pageSize: z.number().int().positive().max(50).default(10),
  query: z.string().trim().max(100).optional(),
  filter: z.string().max(30).optional(),
  tag: z.string().optional(),
  sort: z.string().optional()
})

export const GetRecommendationQuestionsSchema = z.object({
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid user ID" }),
  query: z.string().trim().max(100).optional(),
  skip: z.coerce.number().int().min(0).max(10_000).default(0),
  limit: z.coerce.number().int().positive().max(51).default(10),
})

export const GetTagQuestionsSchema = paginatedSearchParamsSchema.extend({
  tagId: z.string().regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid tag ID" })
})

export const IncrementQuestionViewsSchema = z.object({
  questionId: z.string().min(1, { message: "QuestionId is required" })
})
export const AnswerFormSchema = z.object({
  content: z.string().min(100, { message: "Answer must be at least 100 characters." })
})
export const CreateAnswerSchema = AnswerFormSchema.extend({
  questionId: z.string().min(1, { message: "Question Id is required" })
})
export const AnswerIdSchema = z.object({
  answerId: z.string().regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid answer ID" })
})
export const EditAnswerSchema = AnswerFormSchema.merge(AnswerIdSchema)
export const GetAnswersSchema = paginatedSearchParamsSchema.extend({
  questionId: z.string().min(1, { message: "Question Id is required" }),
  filter: z.enum(["latest", "oldest", "popular"]).optional()
})

export const AIAnswerSchema = z.object({
  question: z
    .string()
    .min(5, { message: "Question is required" })
    .max(120, { message: "Question can't exceed 120 characters" }),
  content: z.string().optional(),
  userAnswer: z.string().optional()
})

export const CreateVoteSchema = z.object({
  targetId: z.string().min(1, { message: "Target Id is required" }),
  targetType: z.enum(["answer", "question"], { message: "Target Type is required" }),
  voteType: z.enum(["upvote", "downvote"], { message: "Vote Type is required" })
})

export const updateVoteCountSchema = CreateVoteSchema.extend({
  change: z.number().int().min(-1).max(1)
})

export const GetUserVotesForTargetsSchema = z.object({
  targetIds: z.array(z.string().min(1)).min(1),
  targetType: z.enum(["answer", "question"], { message: "Target Type is required" })
})

export const HasVotedSchema = z.object({
  targetId: z.string().min(1, { message: "Target Id is required" }),
  targetType: z.enum(["answer", "question"], { message: "Target Type is required" })
})
export const CollectionSchema=z.object({
  questionId:z.string().min(1,{message:'Question Id is required'})

})

export const GetSavedQuestionsSchema = paginatedSearchParamsSchema.extend({
})

export const CreateInteractionSchema=z.object({
  action:z.enum(InteractionActionEnums,{message:'Action is required'}),
  actionTarget:z.enum(['question','answer'],{message:'Action Target is required'}),
  actionId:z.string().min(1,{message:'Action Id is required'}),
  authorId:z.string().min(1,{message:'Author Id is required'}),
  // true reverses the points, e.g. when a vote is removed or switched
  undo:z.boolean().optional()
})
