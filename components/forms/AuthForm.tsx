"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import {
  DefaultValues,
  FieldValues,
  Path,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { ZodSchema, ZodType } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Routes } from "@/constants/route";

interface AuthFormProps<T extends FieldValues> {
  schema: ZodSchema<any>; 
  formType: "SIGN_UP" | "SIGN_IN";
  defaultValues: T;
  onSubmitAction: (data: T) => Promise<{
    success: boolean;
    error?: string;
  }>;
}

export function AuthForm<T extends FieldValues>({
  schema,
  defaultValues,
  formType,
  onSubmitAction,
}: AuthFormProps<T>) {
  const form = useForm<T>({
    resolver: zodResolver(schema as any),
    defaultValues: defaultValues as DefaultValues<T>,
  });

  const handleSubmit: SubmitHandler<T> = async (data) => {
    try {
      const result = await onSubmitAction(data);

      if (!result.success) {
        form.setError("root", {
          type: "server",
          message: result.error || "Something went wrong",
        });
      }
    } catch (error) {
      form.setError("root", {
        type: "server",
        message: "Unexpected error occurred",
      });
    }
  };

  const buttonText = formType === "SIGN_IN" ? "SIGN IN" : "SIGN UP";

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6 mt-10"
      >
        {Object.keys(defaultValues).map((key) => (
          <FormField
            key={key}
            control={form.control}
            name={key as Path<T>}
            render={({ field }) => (
              <FormItem className="flex w-full flex-col gap-2.5">
                <FormLabel className="capitalize paragraph-medium text-dark400_light700">
                  {field.name}
                </FormLabel>
                <FormControl>
                  <Input
                    type={field.name === "password" ? "password" : "text"}
                    placeholder={`Enter ${field.name}`}
                    {...field}
                    className="paragraph-regular background-light900_dark300 light-border-2 text-dark300_light700 no-focus min-h-12 rounded-1.5 border"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        {form.formState.errors.root && (
          <p className="text-sm text-red-500">
            {form.formState.errors.root.message}
          </p>
        )}

        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full paragraph-medium primary-gradient min-h-12 rounded-2 px-4 py-3 font-inter !text-light-900"
        >
          {form.formState.isSubmitting
            ? formType === "SIGN_IN"
              ? "Signing In..."
              : "Signing Up..."
            : buttonText}
        </Button>

        {formType === "SIGN_IN" ? (
          <p className="text-sm text-center">
            Don&#39;t have an account?{" "}
            <Link
              href={Routes.SIGN_UP}
              className="paragraph-semibold primary-text-gradient"
            >
              SIGN UP
            </Link>
          </p>
        ) : (
          <p className="text-sm text-center">
            Already have an account?{" "}
            <Link
              href={Routes.SIGN_IN}
              className="paragraph-semibold primary-text-gradient"
            >
              SIGN IN
            </Link>
          </p>
        )}
      </form>
    </Form>
  );
}
