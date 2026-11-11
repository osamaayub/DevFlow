import Image from "next/image"
import { ReactNode } from "react"

export function AuthFlowCard({ children }: { children: ReactNode }) {
  return (
    <section className="background-light800_dark200 light-border shadow-light-100_dark100 relative w-full max-w-[420px] rounded-md border px-5 py-7 shadow-xl sm:px-6">
      <Image
        src="/images/site-logo.svg"
        alt="DevFlow"
        width={24}
        height={24}
        className="absolute right-5 top-5 object-contain"
      />
      {children}
    </section>
  )
}
