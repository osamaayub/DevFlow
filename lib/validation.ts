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

export const AskAQuestionSchema=z.object({
  title:z.string().min(1,{message:"Title is required"})
    .max(100,{message:"Title cannot be exceed 100 characters"}),
  content:z.string().min(1,{message:"content is required"}),
  tags:z.array(z.string()).min(1,{message:"At least one tag is required"})
    .max(5,{message:"cannot add more than 5 tags"}).nonempty()



})
