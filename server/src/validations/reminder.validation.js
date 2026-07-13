import { z } from "zod";

export const createReminderSchema = z.object({
  appointment: z
    .string()
    .trim()
    .min(1, "Appointment ID is required."),

  reminderType: z.enum(
    ["email", "whatsapp"],
    {
      errorMap: () => ({
        message: "Reminder type must be email or whatsapp.",
      }),
    }
  ),

  reminderTime: z
    .string()
    .trim()
    .min(1, "Reminder time is required."),
});

export const updateReminderSchema =
  createReminderSchema.partial();