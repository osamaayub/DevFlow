import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"


import { auth } from "@/server/auth"
import { UserAvatar } from "@/shared/components/common"
import { Theme } from "@/shared/components/navigation"
import GlobalSearchBar from "@/shared/components/search/GlobalSearchBar"

import MobileNavigation from "./MobileNavigation"


// Reads the session, so it streams in behind the Suspense boundary in Navbar
async function NavbarUser() {
  const session = await auth()
  const user = session?.user

  return (
    <>
      {user?.id && user.name && (
        <UserAvatar id={user.id} name={user.name} image={user.image} className="size-9" />
      )}

      <MobileNavigation userId={user?.id} />
    </>
  )
}

// Static, so it prerenders into the shell and shows instantly on every page
export function Navbar() {
  return (
    <nav className="flex-between background-light900_dark200 fixed z-50 w-full gap-5 p-4 shadow-light-300 dark:shadow-none sm:px-12">
      <Link href="/" className="flex items-center gap-1">
        <Image src="/images/site-logo.svg" alt="DevFlow logo" width={23} height={23} />
        <p className="h2-bold font-space-grotesk text-dark-100 dark:text-light-900 max-sm:hidden">
          Dev <span className="text-primary-500">Flow</span>
        </p>
      </Link>

      <Suspense fallback={null}>
        <GlobalSearchBar />
      </Suspense>

      <div className="flex-between gap-5">
        <Theme />

        <Suspense fallback={<MobileNavigation />}>
          <NavbarUser />
        </Suspense>
      </div>
    </nav>
  )
}
