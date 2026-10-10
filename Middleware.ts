import { NextRequest, NextResponse } from "next/server"

// Do not import `@/auth` here — it pulls Mongoose into the Edge runtime
// and breaks Google/GitHub OAuth. Protect routes in Server Components via `auth()` instead.
export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers)
  const filter = request.nextUrl.searchParams.get("filter")

  if (filter) {
    requestHeaders.set("x-devflow-question-filter", filter)
  } else {
    requestHeaders.delete("x-devflow-question-filter")
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  })
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
}
