import { LogOut } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import React, { Suspense } from "react"

import { auth, signOut } from "@/server/auth"
import ROUTES from "@/shared/constants/route"

import { Button } from "../ui"
import NavLinks from "./navbar/NavLinks"




// Reads the session, so it renders behind the Suspense boundary in LeftSidebar
const LeftSidebarContent = async () => {
  const session = await auth()
  const userId = session?.user?.id

  return (
    <>
      <div className="flex flex-1 flex-col gap-6">
        <NavLinks userId={userId} hideProfile={Boolean(userId)} />
      </div>

      <div className="flex flex-col gap-3">
        {userId ? (
          <form
            action={async () => {
              "use server"

              await signOut()
            }}
          >
            <Button type="submit" className="base-medium w-fit !bg-transparent px-4 py-3">
              <LogOut className="size-5 text-black dark:text-white" />
              <span className="text-dark300_light900 max-lg:hidden">Logout</span>
            </Button>
          </form>
        ) : (
          <>
            <Button
              className="small-medium btn-secondary min-h-10.25 w-full rounded-lg px-4 py-3 shadow-none"
              asChild
            >
              <Link href={ROUTES.SIGN_IN}>
                <Image
                  src="/icons/account.svg"
                  alt="Account"
                  width={20}
                  height={20}
                  className="invert-colors lg:hidden"
                />
                <span className="primary-text-gradient max-lg:hidden">Log In</span>
              </Link>
            </Button>

            <Button
              className="small-medium light-border-2 btn-tertiary text-dark400_light900 min-h-10.25 w-full rounded-lg border px-4 py-3 shadow-none"
              asChild
            >
              <Link href={ROUTES.SIGN_UP}>
                <Image
                  src="/icons/sign-up.svg"
                  alt="Account"
                  width={20}
                  height={20}
                  className="invert-colors lg:hidden"
                />
                <span className="max-lg:hidden">Sign Up</span>
              </Link>
            </Button>
          </>
        )}
      </div>
    </>
  )
}

// Placeholder rows while the session streams in. A fallback renders outside its own
// boundary, so it can't use NavLinks (which reads the current path at request time).
const LeftSidebarFallback = () => (
  <div className="flex flex-1 flex-col gap-6" aria-hidden="true">
    {Array.from({ length: 6 }, (_, index) => (
      <div key={index} className="background-light800_dark300 h-11 animate-pulse rounded-lg" />
    ))}
  </div>
)

const LeftSidebar = () => (
  <section className="custom-scrollbar background-light900_dark200 light-border sticky left-0 top-0 flex h-screen flex-col justify-between overflow-y-auto border-r p-6 pt-36 shadow-light-300 dark:shadow-none max-sm:hidden lg:w-[266px]">
    <Suspense fallback={<LeftSidebarFallback />}>
      <LeftSidebarContent />
    </Suspense>
  </section>
)

export default LeftSidebar
