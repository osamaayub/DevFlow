"use client";

import { AuthForm } from "@/components/forms/AuthForm";
import { SignUpSchema } from "@/lib/validation";

const SignUp = () => {
  return (
    <AuthForm
      schema={SignUpSchema}
      formType="SIGN_UP"
      defaultValues={{ username: "", email: "", password: "" }}
      onSubmitAction={(data: any) => Promise.resolve({ success: true, data })}
    />
  );
};

export default SignUp;
