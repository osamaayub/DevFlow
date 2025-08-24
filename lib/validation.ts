import z from "zod";

export const SignUpSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  email: z.string().email({ message: "please Provide a Valid Email Address" }),
  password: z
    .string()
    .min(6, { message: "password must be aleast of 6 characters" })
    .max(10, { message: "password cannot execede 10 characters" }),
});
export const SignInSchema = z.object({
  email: z
    .string()
    .email({ message: "please Provide a Valid Email Address" })
    .min(1),
  password: z
    .string()
    .min(6, { message: "Password must be of at least 6 characters" })
    .max(10, { message: "password cannot execede 10 characters" }),
});

export const AskQuestionSchema = z.object({
  title: z
    .string()
    .min(5, {
      message: "Title must be at least 5 characters.",
    })
    .max(130, { message: "Title musn't be longer then 130 characters." }),
  content: z.string().min(100, { message: "Minimum of 100 characters." }),
  tags: z
    .array(
      z
        .string()
        .min(1, { message: "Tag must have at least 1 character." })
        .max(15, { message: "Tag must not exceed 15 characters." })
    )
    .min(1, { message: "Add at least one tag." })
    .max(3, { message: "Maximum of 3 tags." }),
});
