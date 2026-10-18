
const ROUTES = {
  HOME: "/",
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  ASK_QUESTION: "/ask-question",
  COLLECTION: "/collection",
  COMMUNITY: "/community",
  COMMUNITY_MEMBER_DETAILS: (id: string) => `/community/${id}/details`,
  TAGS: "/tags",
  JOBS: "/jobs",
  JOBS_DETAILS: (id: string) => `/jobs/${id}`,
  JOBS_APPLY: (id: string) => `/jobs/${id}/apply`,
  JOBS_APPLICANTS: (id: string) => `/jobs/${id}/applicants`,
  JOBS_EDIT: (id: string) => `/jobs/${id}/edit`,
  JOBS_NEW: "/jobs/new",
  PROFILE: (id: string) => `/profile/${id}`,
  QUESTION: (id: string) => `/questions/${id}`,
  EDIT_QUESTION: (id: string) => `/questions/${id}/edit`,
  TAG: (id: string) => `/tags/${id}`,
  SIGN_IN_WITH_OAUTH: `signin-with-oauth`,
  AI_ANSWER: `/api/ai/answers`,
}

export default ROUTES
