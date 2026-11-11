import { Suspense } from "react"

import { AuthPanel } from "@/features/auth/components/AuthPanel"
import { SignInScreen } from "@/features/auth/components/SignInScreen"

type SignInPageProps = {
  searchParams: Promise<{ accountLink?: string; provider?: string; passwordReset?: string }>
}

async function SignInContent({ searchParams }: SignInPageProps) {
  const params = await searchParams
  const provider =
    params.accountLink === "1" &&
    (params.provider === "google" || params.provider === "github")
      ? params.provider
      : null

  return <SignInScreen provider={provider} passwordReset={params.passwordReset === "1"} />
}

export default function SignInPage({ searchParams }: SignInPageProps) {
  return (
    <Suspense
      fallback={
        <AuthPanel title="Welcome Back" description="Sign in to continue to DevFlow">
          <div className="min-h-72" />
        </AuthPanel>
      }
    >
      <SignInContent searchParams={searchParams} />
    </Suspense>
  )
}
