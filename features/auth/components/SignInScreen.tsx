"use client"

import { signInWithCredentials } from "@/features/auth/actions"
import { SignInSchema } from "@/shared/lib/validation"

import { AccountLinkDialog } from "./AccountLinkDialog"
import { AuthForm } from "./AuthForm"
import { AuthPanel } from "./AuthPanel"

type SignInScreenProps = {
  provider: "google" | "github" | null
  passwordReset: boolean
}

export function SignInScreen({ provider, passwordReset }: SignInScreenProps) {
  return (
    <AuthPanel
      title="Welcome Back"
      description="Sign in to continue to DevFlow"
      showSocialAuth
    >
      {passwordReset && (
        <p className="mt-6 rounded-md bg-green-100 px-3 py-2 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-200">
          Your password has been updated. You can sign in now.
        </p>
      )}
      <AuthForm
        schema={SignInSchema}
        formType="SIGN_IN"
        defaultValues={{ email: "", password: "" }}
        onSubmitAction={(data) => signInWithCredentials(data)}
      />
      {provider && <AccountLinkDialog provider={provider} />}
    </AuthPanel>
  )
}
