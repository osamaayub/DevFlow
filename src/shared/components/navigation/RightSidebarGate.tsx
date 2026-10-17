"use client"

import { usePathname } from "next/navigation"
import { ReactNode } from "react"

// Routes that render their own right-hand column instead of the global sidebar
const HIDDEN_PREFIXES = ["/profile", "/jobs"]

const RightSidebarGate = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname()
  const hidden = HIDDEN_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )

  return hidden ? null : children
}

export default RightSidebarGate
