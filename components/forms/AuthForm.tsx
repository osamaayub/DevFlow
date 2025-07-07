"use client";

import {
  DefaultValues,
  FieldValues,
  SubmitHandler,
  useForm,
  Path,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z, ZodType } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Routes } from "@/constants/route";
import Link from "next/link";

interface AuthFormProps<T extends FieldValues> {
  schema: ZodType<T>;
  formType: "SIGN_UP" | "SIGN_IN";
  defaultValues: T;
  onSubmitAction: (data: T) => Promise<{ sucess: boolean }>;
}

export function AuthForm<T extends FieldValues>({
  schema,
  defaultValues,
  formType,
  onSubmitAction,
}: AuthFormProps<T>) {
  // ✅ Select schema based on formType

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as DefaultValues<T>,
  });

  const handleSubmit: SubmitHandler<T> = async () => {
    //Authenticate the User here
  };
  const buttonText = formType === "SIGN_IN" ? "SIGN IN" : "SIGN UP";

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className=" space-y-6 mt-10"
      >
        {Object.keys(defaultValues).map((key) => (
          <FormField
            key={key}
            control={form.control}
            name={key as Path<T>}
            render={({ field }) => (
              <FormItem className=" flex w-full flex-col gap-2.5">
                <FormLabel className="capitalize  paragraph-medium text-dark400_light700">
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
        <Button
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
          <p>
            Don't have an account?{" "}
            <Link
              href={Routes.SIGN_UP}
              className="paragraph-semibold primary-text-gradient"
            >
              SIGN UP
            </Link>
          </p>
        ) : (
          <p>
            Already have an account? {"  "}
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
