import z from "zod";

export const registerSchema = z.object({
    body : z.object({
        email: z.string().email('Invalid email format'),
        password: z.string().min(3,'Password required'),
    }),
})


export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(3, 'Password is required'),
  }),
});