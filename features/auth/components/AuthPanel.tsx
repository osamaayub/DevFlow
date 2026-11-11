import Image from "next/image"
import { ReactNode } from "react"

import SocialAuthForm from "./SocialAuthForm"

type AuthPanelProps = {
  title: string
  description: string
  children: ReactNode
  showSocialAuth?: boolean
}

export function AuthPanel({
  title,
  description,
  children,
  showSocialAuth = false
}: AuthPanelProps) {
  return (
    <section className="background-light800_dark200 light-border shadow-light-100_dark100 w-full max-w-[520px] rounded-[10px] border px-5 py-8 shadow-md sm:px-8 sm:py-10">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="h2-bold text-dark-100_light900">{title}</h1>
          <p className="paragraph-regular text-dark500_light400">{description}</p>
        </div>
        <Image
          src="/images/site-logo.svg"
          alt="DevFlow"
          width={50}
          height={50}
          className="shrink-0 object-contain"
        />
      </div>
      {children}
      {showSocialAuth && <SocialAuthForm />}
    </section>
  )
}
