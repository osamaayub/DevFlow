import "server-only"

import { connection } from "next/server"

/**
 * Defers the caller until an actual request is being served.
 *
 * With Cache Components and Partial Prefetching, Next.js prerenders routes (and runtime
 * prefetches) without a live request. Uncached database work can't run there: Mongoose and
 * the MongoDB driver read the clock and generate random IDs, which a prerender rejects.
 * Awaiting `connection()` first moves that work to request time.
 *
 * `connection()` throws in scopes where the question doesn't apply (inside `after()` or a
 * cache scope, both of which may already use the database), so those throws are ignored.
 */
export async function deferToRequestTime(): Promise<void> {
  try {
    await connection()
  } catch {
    // Not in a request-scoped render (after(), cache scope): continue normally
  }
}
