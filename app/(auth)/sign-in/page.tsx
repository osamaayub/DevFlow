"use client";


import { AuthForm } from "@/components/forms/AuthForm";
import { Routes } from "@/constants/route";
import { signInWithCredentials } from "@/lib/actions"; // Import your server action
import { SignInSchema } from "@/lib/validation";

const SignIn = () => {
  return (
    <AuthForm
      schema={SignInSchema}
      formType="SIGN_IN"
      defaultValues={{ email: "", password: "" }}
      onSubmitAction={async (data) => {
        try {
          const result = await signInWithCredentials({
            email: data.email,
            password: data.password,
          });

          if (!result.success) {
            return {
              success: false,
              error: {
                message: result.error?.message || "Sign in failed. Please try again.",
              },
            };
          }

          // Optional: redirect after successful sign in
          window.location.href = Routes.HOME;

          return {
            success: true,
          };
        } catch (error:unknown) {
          return {
            success: false,
            error: {
              message: "Sign in failed. Please try again.",
            },
          };
        }
      }}
    />
  );
};

export default SignIn;