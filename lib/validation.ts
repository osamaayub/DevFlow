import z from "zod";

export const SignUpSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
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


export const UserSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  email: z.string().email({ message: "please Provide a Valid Email Address" }),
  reputation: z.number().min(0, { message: "Reputation cannot be negative." }),
  bio: z.string().max(500, { message: "Bio cannot exceed 500 characters." }).optional(),
  location: z.string().max(100, { message: "Location cannot exceed 100 characters." }).optional(),
  portfolio: z.string().url({ message: "Portfolio must be a valid URL." }).optional(),
  image: z.string().url({ message: "Image must be a valid URL." }),
  joinedAt: z.date(),
  password: z.string().min(6, { message: "password must be aleast of 6 characters" }).max(10, { message: "password cannot execede 10 characters" })


}); 

export const AccountUpdateSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",   
  }),
  image: z.string().url({ message: "Image must be a valid URL." }).optional(),
  password: z.string().min(6, { message: "password must be aleast of 6 characters" }).max(10, { message: "password cannot execede 10 characters" }).optional(),
  userId: z.string().min(1, { message: "User ID is required." }),       
  provider: z.string().min(1, { message: "Provider is required." }),
  providerAccountId: z.string().min(1, { message: "Provider Account ID is required." }),
})