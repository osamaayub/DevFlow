import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Do not import `@/auth` here — it pulls Mongoose into the Edge runtime
// and breaks Google/GitHub OAuth. Protect routes in Server Components via `auth()` instead.
export function middleware(_request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
}
