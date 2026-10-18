import "server-only"

import { connection } from "next/server"

/**
 * Defers the caller until an actual request is being served.
 *
 * With Cache Components and Partial Prefetching, Next.js prerenders routes (and runtime
 * prefetches) without a live request. Uncached database work can't run there: Mongoose and
 * the MongoDB driver read the clock and generate random IDs, which a prerender rejects.
 * Awaiting `connection()` first moves that work to request time.
 */
export async function deferToRequestTime(): Promise<void> {
  let requestReady: Promise<void>

  try {
    requestReady = connection()
  } catch {
    // connection() throws synchronously where the question doesn't apply: inside after()
    // or a cache scope, both of which may use the database. Continue normally there.
    return
  }

  // Not caught: during a prerender this promise never resolves, and Next.js rejects it to
  // stop the render. Swallowing that would let the caller keep running in the prerender.
  await requestReady
}
