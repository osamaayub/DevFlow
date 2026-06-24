"use client";

import { AuthForm } from "@/components/forms/AuthForm";
import { SignUpSchema } from "@/lib/validation";

const SignUp = () => {
  return (
    <AuthForm
      schema={SignUpSchema}
      formType="SIGN_UP"
      defaultValues={{ name: "", username: "", email: "", password: "" }}
      onSubmitAction={async (data) => {
        try {
          const res = await fetch("/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });

          if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            return {
              success: false,
              error: body?.error || body?.message || "Failed to create user",
            };
          }

          return { success: true };
        } catch {
          return { success: false, error: "Network error while creating user" };
        }
      }}
    />
  );
};

export default SignUp;
