"use client";

import { AuthForm } from "@/components/forms/AuthForm";
import { usersApi } from "@/lib/api";
import { SignUpSchema } from "@/lib/validation";

type ErrorWithDetails = {
  details?: {
    message?: string;
  };
  message?: string;
};

const isErrorWithDetails = (value: unknown): value is ErrorWithDetails => {
  return (
    typeof value === "object" &&
    value !== null &&
    ("message" in value || "details" in value)
  );
};

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
            error instanceof Error
              ? error.message
              : isErrorWithDetails(error)
              ? error.details?.message || error.message || "Network error while creating user"
              : "Network error while creating user";
          return { success: false, error: message };
        }
      }}
    />
  );
};

export default SignUp;
