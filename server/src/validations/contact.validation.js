import { z } from "zod";

export const createContactSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters long.")
    .max(100, "Full name cannot exceed 100 characters."),

  phone: z
    .string()
    .trim()
    .min(10, "Phone number must be at least 10 digits.")
    .max(15, "Phone number cannot exceed 15 digits."),

  email: z
    .string()
    .trim()
    .email("Invalid email address.")
    .optional(),

  company: z
    .string()
    .trim()
    .max(100, "Company name cannot exceed 100 characters.")
    .optional(),

  designation: z
    .string()
    .trim()
    .max(100, "Designation cannot exceed 100 characters.")
    .optional(),

  notes: z
    .string()
    .trim()
    .max(500, "Notes cannot exceed 500 characters.")
    .optional(),

  isFavorite: z
    .boolean()
    .optional(),
});


export const updateContactSchema = createContactSchema.partial()

export const toggleFavoriteSchema = z.object({
  isFavorite: z.boolean(),
})