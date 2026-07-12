"use client";

import { usersApi } from "@/lib/api";
import { SignUpSchema } from "@/lib/validation";
import { AuthForm } from "@/components/forms/AuthForm";

const SignUp = () => {
  return (
    <AuthForm
      schema={SignUpSchema}
      formType="SIGN_UP"
      defaultValues={{ name: "", username: "", email: "", password: "" }}
      onSubmitAction={async (data) => {
        try {
          await usersApi.create(data);
          return { success: true };
        } catch (error: unknown) {
          const message =
            (error as any)?.details?.message ||
            (error as any)?.message ||
            "Network error while creating user";
          return { success: false, error: message };
        }
      }}
    />
  );
};

export default SignUp;
