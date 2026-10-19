"use client"

import { SessionProvider } from "next-auth/react"
import { ReactNode } from "react"
import { Toaster } from "sonner"

import ThemeProvider from "@/shared/context/Theme"

export function Providers({ children }: { children: ReactNode }) {
  return (
    // Fetches the session once on the client, so the server shell stays static
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        {children}
        <Toaster />
      </ThemeProvider>
    </SessionProvider>
  )
}
