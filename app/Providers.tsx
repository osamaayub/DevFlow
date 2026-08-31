"use client"

import dynamic from "next/dynamic"
import type { Session } from "next-auth"
import { SessionProvider } from "next-auth/react"
import { ReactNode } from "react"
import { Toaster } from "sonner"

import ThemeProvider from "@/context/Theme"

const DynamicChildren = dynamic(
  () => Promise.resolve(({ children }: { children: ReactNode }) => children),
  { ssr: false }
)

export function Providers({ children, session }: { children: ReactNode; session: Session | null }) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <DynamicChildren>{children}</DynamicChildren>
        <Toaster />
      </ThemeProvider>
    </SessionProvider>
  )
}
