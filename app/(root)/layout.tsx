import { redirect } from "next/navigation"
import { ReactNode, Suspense } from "react"

import { auth } from "@/server/auth"
import { LeftSidebar, RightSidebar, RightSidebarGate, Navbar } from "@/shared/components/navigation"
import ROUTES from "@/shared/constants/route"

const AuthenticatedRootLayout = async ({ children }: { children: ReactNode }) => {
  const session = await auth()

  if (!session?.user?.id) {
    redirect(ROUTES.SIGN_IN)
  }

  return (
    <main className="background-light850_dark100 relative">
      <Navbar />
      <div className="flex">
        <LeftSidebar />
        <section className="flex min-h-screen min-w-0 flex-1 flex-col px-4 pb-6 pt-24 max-md:pb-14 xs:px-5 sm:px-8 lg:px-10 xl:px-12">
          {children}
        </section>
        {/* RightSidebarGate reads the current path, which is request-time data */}
        <Suspense fallback={null}>
          <RightSidebarGate>
            <Suspense fallback={null}>
              <RightSidebar />
            </Suspense>
          </RightSidebarGate>
        </Suspense>
      </div>
    </main>
  )
}

const RootLayout = ({ children }: { children: ReactNode }) => (
  <Suspense fallback={null}>
    <AuthenticatedRootLayout>{children}</AuthenticatedRootLayout>
  </Suspense>
)

export default RootLayout
