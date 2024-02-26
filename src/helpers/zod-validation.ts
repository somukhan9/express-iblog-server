import { z } from "zod"

export const userValidationSchema = z.object({
  name: z.string({ required_error: "Please provide a name" }),
  username: z.string({ required_error: "Please provide a username" }),
  email: z.string({ required_error: "Please provide a valid email" }).email(),
  password: z
    .string({ required_error: "Please enter the password" })
    .min(6, { message: "Password should be at least of 6 characters" }),
})

export const loginValidationSchema = z.object({
  username: z.string({ required_error: "Please enter username or email" }),
  password: z.string({ required_error: "Please enter password" }),
})
