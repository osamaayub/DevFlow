"use client";

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

import { Button } from "@/shared/components/ui"

export default function Theme() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isDark = mounted && resolvedTheme === "dark"

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="text-primary-500 hover:bg-transparent hover:text-primary-500 dark:hover:bg-transparent"
    >
      {isDark ? <Moon className="size-6 fill-current" /> : <Sun className="size-6" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
