"use client"

import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { FormEvent, useState } from "react"
import { toast } from "sonner"

import { createAccountLinkIntent } from "@/features/auth/account-link.actions"
import Routes from "@/shared/constants/route"

type AccountLinkDialogProps = {
  provider: "google" | "github"
}

const providerName = {
  google: "Google",
  github: "GitHub"
} as const

export function AccountLinkDialog({ provider }: AccountLinkDialogProps) {
  const router = useRouter()
  const [showCredentials, setShowCredentials] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const closeDialog = () => router.replace(Routes.SIGN_IN)

  const handleLink = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const result = await createAccountLinkIntent({ email, password, provider })
      if (!result.success) {
        toast.error(result.error || "Unable to verify your account.")
        return
      }

      const response = await signIn(provider, {
        redirect: false,
        redirectTo: Routes.HOME
      })
      if (response?.url) {
        window.location.assign(response.url)
      } else {
        toast.error("Unable to continue account linking. Please try again.")
      }
    } catch {
      toast.error("Unable to continue account linking. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 py-8">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-link-title"
        className="background-light800_dark200 w-full max-w-[520px] rounded-md px-6 py-6 shadow-2xl sm:px-8"
      >
        {!showCredentials ? (
          <>
            <h2 id="account-link-title" className="h3-bold pr-8 text-dark-100_light900">
              Looks Like You Already Have an Account!
            </h2>
            <p className="body-regular mt-4 text-dark500_light400">
              It seems you&apos;ve previously created an account using your email and password.
            </p>
            <p className="body-regular mt-3 text-dark500_light400">
              You can link your {providerName[provider]} login after confirming your existing account.
            </p>
            <p className="body-regular mt-3 text-dark500_light400">
              Your existing account stays the same, and you can keep signing in with either method.
            </p>
            <button
              type="button"
              onClick={() => setShowCredentials(true)}
              className="primary-gradient mt-5 min-h-11 w-full rounded-md px-4 text-sm font-semibold text-white"
            >
              Yes, Link My Accounts
            </button>
            <button
              type="button"
              onClick={closeDialog}
              className="small-medium mt-3 w-full text-dark500_light400 hover:text-primary-500"
            >
              No, I&apos;ll Keep Using Email Login
            </button>
          </>
        ) : (
          <>
            <h2 id="account-link-title" className="h3-bold pr-8 text-dark-100_light900">
              Confirm your existing account
            </h2>
            <p className="body-regular mt-2 text-dark500_light400">
              Sign in with your DevFlow email and password to authorize linking your {providerName[provider]} account.
            </p>
            <form onSubmit={handleLink} className="mt-5 space-y-3">
              <label htmlFor="link-email" className="small-medium block text-dark-300 dark:text-light-700">
                Email address
              </label>
              <input
                id="link-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="background-light900_dark300 light-border-2 text-dark300_light700 min-h-10 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
              />
              <label htmlFor="link-password" className="small-medium block text-dark-300 dark:text-light-700">
                Password
              </label>
              <input
                id="link-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="background-light900_dark300 light-border-2 text-dark300_light700 min-h-10 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="primary-gradient min-h-11 w-full rounded-md px-4 text-sm font-semibold text-white disabled:opacity-60"
              >
                {isSubmitting ? "Verifying..." : `Continue with ${providerName[provider]}`}
              </button>
              <button
                type="button"
                onClick={() => setShowCredentials(false)}
                disabled={isSubmitting}
                className="small-medium w-full text-dark500_light400 hover:text-primary-500"
              >
                Back
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  )
}
