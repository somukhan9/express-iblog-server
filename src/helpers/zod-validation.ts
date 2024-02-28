import { z } from "zod"

const userValidationSchema = z.object({
  name: z.string({ required_error: "Please provide a name" }),
  username: z.string({ required_error: "Please provide a username" }),
  email: z.string({ required_error: "Please provide a valid email" }).email(),
  password: z
    .string({ required_error: "Please enter the password" })
    .min(6, { message: "Password should be at least of 6 characters" }),
})

const loginValidationSchema = z.object({
  username: z.string({ required_error: "Please enter username or email" }),
  password: z.string({ required_error: "Please enter password" }),
})

const postValidationSchema = z.object({
  title: z.string({ required_error: "Please provide a title" }),
  body: z.string({ required_error: "Please provide a body" }),
  category: z.string({ required_error: "Please provide a category" }),
})

export { userValidationSchema, loginValidationSchema, postValidationSchema }
