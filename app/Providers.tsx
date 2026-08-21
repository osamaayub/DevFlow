"use client"

import type { Session } from "next-auth"
import { SessionProvider } from "next-auth/react"
import { ReactNode } from "react"
import { Toaster } from "sonner"

import ThemeProvider from "@/context/Theme"

export function Providers({
  children,
  session
}: {
  children: ReactNode
  session: Session | null
}) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        {children}
        <Toaster />
      </ThemeProvider>
    </SessionProvider>
  )
}
