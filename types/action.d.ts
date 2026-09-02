import { ZodSchema } from "zod"

export type ActionOptions<T> = {
  params?: T
  schema?: ZodSchema<T>
  authorize?: boolean
}
export interface AuthCredentials {
  name: string
  username: string
  email: string
  password: string
}
export interface createQuestionParams {
  title: string
  content: string
  tags: string[]
}
export interface EditQuestionParams extends createQuestionParams {
  questionId: string
}
export interface GetTagQuestionsParams extends Omit<PaginatedSearchParams, "filter"> {
  tagId: string
}
export interface GetQuestionParams {
  questionId: string
}

export interface IncrementQuestionViewsParams {
  questionId: string
}
