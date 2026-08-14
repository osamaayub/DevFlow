"use client";

import { AuthForm } from "@/components/forms/AuthForm";
import { signInWithCredentials } from "@/lib/actions"
import { SignInSchema } from "@/lib/validation";

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




