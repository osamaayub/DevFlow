import { Suspense } from "react"

import { AuthFlowCard } from "@/features/auth/components/AuthFlowCard"
import { PasswordResetFormScreen } from "@/features/auth/components/PasswordResetScreens"

type ResetPasswordPageProps = {
  searchParams: Promise<{ token?: string | string[] }>
}

async function ResetPasswordContent({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams
  const token = typeof params.token === "string" ? params.token : undefined

  return <PasswordResetFormScreen token={token} />
}

export default function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  return (
    <Suspense
      fallback={
        <AuthFlowCard>
          <h1 className="h3-bold pr-9 text-dark-100_light900">Choose a new password</h1>
          <div className="mt-5 min-h-48" />
        </AuthFlowCard>
      }
    >
      <ResetPasswordContent searchParams={searchParams} />
    </Suspense>
  )
}
