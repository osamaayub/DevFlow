import { ReactNode } from "react"
import { Suspense } from "react"

import { LeftSidebar, RightSidebar, RightSidebarGate, Navbar } from "@/shared/components/navigation"

const RootLayout = async ({ children }: { children: ReactNode }) => {
  // ← ADD async HERE
  return (
    <main className="background-light850_dark100 relative">
      <Navbar />
      <div className="flex">
        <LeftSidebar />
        <section className="flex min-h-screen min-w-0 flex-1 flex-col px-4 pb-6 pt-24 max-md:pb-14 xs:px-5 sm:px-8 lg:px-10 xl:px-12">
          {children}
        </section>
        <RightSidebarGate>
          <Suspense fallback={null}>
            <RightSidebar />
          </Suspense>
        </RightSidebarGate>
      </div>
    </main>
  )
}

export default RootLayout
