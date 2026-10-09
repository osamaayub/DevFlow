import { PaginatedSearchParams } from "./global"

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

export interface CreateQuestionParams {
  title: string
  content: string
  tags: string[]
}

export interface EditQuestionParams extends CreateQuestionParams {
  questionId: string
}

export interface GetTagQuestionsParams extends PaginatedSearchParams {
  tagId: string
}

export interface GetQuestionParams {
  questionId: string
}

export interface IncrementQuestionViewsParams {
  questionId: string
}

export interface CreateAnswerParams {
  questionId: string
  content: string
}

export interface GetAnswersParams extends PaginatedSearchParams {
  questionId: string
}

export interface UpdateVoteCountParams extends CreateVoteParams {
  change: 1 | -1
}
export interface CreateVoteParams {
  targetId: string
  targetType: "question" | "answer"
  voteType: "upvote" | "downvote"
}

export interface HasVotedParams {
  targetId: string
  targetType: "question" | "answer"
}

export type VoteState = {
  hasUpVoted: boolean
  hasDownVoted: boolean
}

export interface VoteParams {
  targetId: string
  targetType: "question" | "answer"
  upvotes: number
  downvotes: number
  hasVotedPromise: Promise<ActionResponse<VoteState>>
}


export interface collectionBaseParams{
  questionId:string,

}
