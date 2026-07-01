import {z} from "zod"

export const registerSchema = z.object({
    fullName : z
    .string()
    .trim()
    .min(3, "Full name must be at least 3 characters"),

    email: z
    .email("Invalid email address")
    .trim()
    .toLowerCase(),

    password: z
    .string()
    .min(8, "Password must be at least 8 characters"),

    phone: z
    .string()
    .optional(),
})

export const loginSchema = z.object({
    email: z
    .string()
    .trim()
    .email("Please provide a valid email address."),

    password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
})