"use client";

import { signInWithCredentials } from "@/features/auth/actions"
import { AuthForm } from "@/features/auth/components"
import { SignInSchema } from "@/shared/lib/validation";

const SignIn = () => {
  return (
    <AuthForm
      schema={SignInSchema}
      formType="SIGN_IN"
      defaultValues={{ email: "", password: "" }}
      onSubmitAction={(data) => signInWithCredentials(data)}
    />
  )
};

export default SignIn; 




