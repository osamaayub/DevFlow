"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"

import { AuthFlowCard } from "@/features/auth/components/AuthFlowCard"
import { requestPasswordReset, resetPassword } from "@/features/auth/password-reset.actions"
import Routes from "@/shared/constants/route"

type PasswordResetScreensProps = {
  token?: string
}

export function PasswordResetRequestScreen() {
  const [email, setEmail] = useState("")
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const sendLink = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault()
    setError("")
    setNotice("")
    setIsSubmitting(true)

    try {
      const result = await requestPasswordReset(email)
      if (!result.success) {
        setError(result.error || "Unable to send a reset link right now.")
        return
      }

      setSentTo(email.trim())
      setNotice("If an account exists for this address, a reset link is on its way.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthFlowCard>
      {!sentTo ? (
        <>
          <h1 className="h3-bold pr-9 text-dark-100_light900">Forgot password?</h1>
          <p className="body-regular mt-1 text-dark500_light400">
            No worries, we&apos;ll send you reset instructions.
          </p>
          <form onSubmit={sendLink} className="mt-5 space-y-3">
            <label
              htmlFor="reset-email"
              className="small-medium block text-dark-300 dark:text-light-700"
            >
              Email address
            </label>
            <input
              id="reset-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="background-light900_dark300 light-border-2 text-dark300_light700 min-h-10 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
            />
            {error && <p role="alert" className="small-regular text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={isSubmitting}
              className="primary-gradient min-h-10 w-full rounded-md px-4 text-sm font-semibold text-white disabled:opacity-60"
            >
              {isSubmitting ? "Sending..." : "Continue"}
            </button>
          </form>
        </>
      ) : (
        <>
          <h1 className="h3-bold pr-9 text-dark-100_light900">Check your email</h1>
          <p className="body-regular mt-1 text-dark500_light400">
            If an account exists for <span className="font-medium">{sentTo}</span>, we sent a password
            reset link.
          </p>
          <button
            type="button"
            onClick={() => void sendLink()}
            disabled={isSubmitting}
            className="primary-gradient mt-5 min-h-10 w-full rounded-md px-4 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isSubmitting ? "Sending..." : "Resend"}
          </button>
          {notice && <p role="status" className="small-regular mt-2 text-dark500_light400">{notice}</p>}
          {error && <p role="alert" className="small-regular mt-2 text-red-500">{error}</p>}
        </>
      )}
      <Link
        href={Routes.SIGN_IN}
        className="small-medium mt-4 flex justify-center text-dark500_light400 hover:text-primary-500"
      >
        ↖ Back to login
      </Link>
    </AuthFlowCard>
  )
}

export function PasswordResetFormScreen({ token }: PasswordResetScreensProps) {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    if (!token) {
      setError("This reset link is invalid or has expired. Request a new one.")
      return
    }

    setIsSubmitting(true)
    try {
      const result = await resetPassword(token, password)
      if (!result.success) {
        setError(result.error || "Unable to reset your password.")
        return
      }
      setIsComplete(true)
      router.replace(`${Routes.SIGN_IN}?passwordReset=1`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthFlowCard>
      {isComplete ? (
        <>
          <h1 className="h3-bold pr-9 text-dark-100_light900">Password updated</h1>
          <p className="body-regular mt-1 text-dark500_light400">
            Your password has been changed. You can now sign in with your new password.
          </p>
          <Link
            href={Routes.SIGN_IN}
            className="primary-gradient mt-5 flex min-h-10 w-full items-center justify-center rounded-md px-4 text-sm font-semibold text-white"
          >
            Back to login
          </Link>
        </>
      ) : (
        <>
          <h1 className="h3-bold pr-9 text-dark-100_light900">Choose a new password</h1>
          <p className="body-regular mt-1 text-dark500_light400">
            Enter a new password for your DevFlow account.
          </p>
          <form onSubmit={handleSubmit} className="mt-5 space-y-3">
            <label htmlFor="new-password" className="small-medium block text-dark-300 dark:text-light-700">
              New password
            </label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              maxLength={10}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="background-light900_dark300 light-border-2 text-dark300_light700 min-h-10 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
            />
            <label htmlFor="confirm-password" className="small-medium block text-dark-300 dark:text-light-700">
              Confirm password
            </label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              maxLength={10}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="background-light900_dark300 light-border-2 text-dark300_light700 min-h-10 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
            />
            {error && <p role="alert" className="small-regular text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={isSubmitting}
              className="primary-gradient min-h-10 w-full rounded-md px-4 text-sm font-semibold text-white disabled:opacity-60"
            >
              {isSubmitting ? "Updating..." : "Reset password"}
            </button>
          </form>
        </>
      )}
    </AuthFlowCard>
  )
}
