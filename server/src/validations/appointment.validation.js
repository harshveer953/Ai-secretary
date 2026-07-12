import { z } from "zod"

export const createAppointmentSchema = z.object({
     title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters long.")
    .max(100, "Title cannot exceed 100 characters."),

  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters.")
    .optional(),

  contact: z
    .string()
    .trim()
    .min(1, "Contact ID is required."),

  appointmentDate: z
    .string()
    .trim()
    .min(1, "Appointment date is required."),

  appointmentTime: z
    .string()
    .trim()
    .min(1, "Appointment time is required."),

  duration: z
    .number()
    .int()
    .positive()
    .optional(),

})

export const updateAppointmentSchema = createAppointmentSchema.partial()

export const updateAppointmentStatusSchema = z.object({
  status: z.enum([
    "scheduled",
    "completed",
    "cancelled",
    "missed",
  ]),
})