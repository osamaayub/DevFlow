import "server-only"

/**
 * Tags for data cached with `unstable_cache`. Any server action that changes the
 * underlying data must call `updateTag()` with the matching tag, so readers see the
 * change immediately instead of waiting for the time-based revalidation.
 */
export const CACHE_TAGS = {
  /** Question lists: home feed and the right sidebar (titles, votes, answer counts, tags) */
  questions: "questions",
  /** Tag lists: tags page and popular tags in the right sidebar (names, question counts) */
  tags: "tags",
} as const

/** Seconds before cached lists refresh on their own, as a safety net for missed invalidations */
export const CACHE_REVALIDATE_SECONDS = {
  questions: 60,
  tags: 300,
} as const
