"use client"

import Link from "next/link"
import { useEffect } from "react"

import { Button } from "@/shared/components/ui"
import ROUTES from "@/shared/constants/route"

type AppErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

const AppError = ({ error, reset }: AppErrorProps) => {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="background-light850_dark100 flex min-h-screen items-center justify-center p-6">
      <section
        className="background-light900_dark200 light-border w-full max-w-lg rounded-2xl border p-8 text-center shadow-sm"
        role="alert"
      >
        <p className="small-medium text-primary-500">DevFlow</p>
        <h1 className="h2-semibold text-dark100_light900 mt-3">Something went wrong</h1>
        <p className="body-regular text-dark400_light500 mt-3">
          We could not load this page. Please try again or return to the home page.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button type="button" onClick={reset}>
            Try again
          </Button>
          <Button asChild variant="outline">
            <Link href={ROUTES.HOME}>Go to home</Link>
          </Button>
        </div>
      </section>
    </main>
  )
}

export default AppError
