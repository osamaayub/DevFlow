export { auth as middleware } from "@/auth"

// Optionally, you can add a matcher to optimize where the middleware runs:
export const config = {
  // The matcher dictates which routes the middleware will run on.
  // This regex excludes static files, next internals, and images.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
}
