"use client"

import Image from "next/image"
import { signIn } from "next-auth/react"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/shared/components/ui"
import Routes from "@/shared/constants/route"
import logger from "@/shared/lib/logger"


const SocialAuthForm = () => {
  const [isSigningIn, setIsSigningIn] = useState<"github" | "google" | null>(null)
  const ButtonClass =
    "background-dark400_light900 body-medium text-dark200_light900 min-h-12 flex-1 rounded-2 px-4 py-3.5"

  const handleSignIn = async (provider: "github" | "google") => {
    if (isSigningIn) return
    setIsSigningIn(provider)

    try {
      // An explicit full-page navigation is more reliable in mobile Safari/Chrome
      // than relying on an implicit client-side OAuth redirect. Always leave the
      // sign-in page after a successful OAuth flow.
      const callbackUrl = Routes.HOME
      const result = await signIn(provider, {
        redirect: false,
        redirectTo: callbackUrl
      })

      if (result?.url) {
        window.location.assign(result.url)
        return
      }

      toast.error("Unable to start social sign-in. Please try again.")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logger.error(
        {
          err: error,
          message: errorMessage,
          provider
        },
        "Social authentication failed during OAuth provider request"
      )
      toast.error("Social sign-in failed. Please refresh and try again.")
    } finally {
      setIsSigningIn(null)
    }
  }

  return (
    <div className="mt-10 flex flex-wrap gap-2.5">
      <Button type="button" className={ButtonClass} disabled={!!isSigningIn} onClick={() => handleSignIn("google")}>
        <Image
          src="/icons/google.svg"
          alt="google logo"
          width="20"
          height="20"
          className="mr-2.5 object-contain"
        />
        <span>{isSigningIn === "google" ? "Connecting..." : "Login With Google"}</span>
      </Button>
      <Button type="button" className={ButtonClass} disabled={!!isSigningIn} onClick={() => handleSignIn("github")}>
        <Image
          src="/icons/github.svg"
          alt="github logo"
          width="20"
          height="20"
          className="invert-colors mr-2.5 object-contain"
        />
        <span>{isSigningIn === "github" ? "Connecting..." : "Login With Github"}</span>
      </Button>
    </div>
  )
}

export default SocialAuthForm
