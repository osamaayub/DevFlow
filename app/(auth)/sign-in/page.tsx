"use client";

import { AuthForm } from "@/components/forms/AuthForm";
import { SignInSchema } from "@/lib/validation";

const SignIn = () => {
  return (
    <AuthForm
      schema={SignInSchema}
      formType="SIGN_IN"
      defaultValues={{ email: "", password: "" }}
      onSubmitAction={(data: any) => Promise.resolve({ success: true, data })}
    />
  );
};

export default SignIn;
