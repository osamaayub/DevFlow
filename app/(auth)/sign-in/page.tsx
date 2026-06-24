"use client";

import { signIn } from "next-auth/react";

import { AuthForm } from "@/components/forms/AuthForm";
import { Routes } from "@/constants/route";
import { SignInSchema } from "@/lib/validation";

const SignIn = () => {
  return (
    <AuthForm
      schema={SignInSchema}
      formType="SIGN_IN"
      defaultValues={{ email: "", password: "" }}
      onSubmitAction={async (data) => {
        try {
          const result = await signIn("credentials", {
            email: data.email,
            password: data.password,
            redirect: false,
            callbackUrl: Routes.HOME,
          });

          if (result?.error) {
            return {
              success: false,
              error: "Invalid email or password",
            };
          }

          return {
            success: true,
            redirectTo: Routes.HOME,
          };
        } catch {
          return {
            success: false,
            error: "Sign in failed. Please try again.",
          };
        }
      }}
    />
  );
};

export default SignIn;
