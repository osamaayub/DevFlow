// Runs once when the Next.js server starts.
export async function register() {
  // Mongoose only works in the Node.js runtime
  if (process.env.NEXT_RUNTIME !== "nodejs") return

  const { dbConnect } = await import("@/server/db/connect")

  // Open the MongoDB connection in the background, so the first request (often an OAuth
  // sign-in) doesn't pay the multi-second cold connect. Not awaited: startup isn't blocked,
  // and dbConnect() reuses this same pending connection when a request needs it.
  dbConnect().catch(() => {
    // dbConnect already logs the failure and resets its cache, so the next request retries
  })
}
