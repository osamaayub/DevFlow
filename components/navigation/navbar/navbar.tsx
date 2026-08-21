import Image from "next/image"
import Link from "next/link"

import { auth } from "@/auth"
import UserAvatar from "@/components/userAvatar"

import { Theme } from "../Theme"
import MobileNavigation from "./MobileNavigation"

export async function Navbar() {
  const session = await auth()
  const user = session?.user

  return (
    <nav className="flex-between background-light900_dark200 fixed z-50 w-full p-6 shadow-light-300 dark:shadow-none sm:px-12">
      <Link href="/" className="flex items-center gap-1">
        <Image src="/images/site-logo.svg" alt="DevFlow logo" width={23} height={23} />
        <p className="h2-bold font-space-grotesk text-dark-100 dark:text-light-900 max-sm:hidden">
          Dev <span className="text-primary-500">Flow</span>
        </p>
      </Link>

      <div className="flex-between gap-5">
        <Theme />

        {user?.id && user.name && (
          <UserAvatar id={user.id} name={user.name} image={user.image} className="size-9" />
        )}

        <MobileNavigation />
      </div>
    </nav>
  )
}
