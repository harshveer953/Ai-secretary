import { z } from "zod";

export const createCallSchema = z.object({
  contact: z.string().trim().min(1),

  callType: z.enum([
    "incoming",
    "outgoing",
  ]),

  status: z.enum([
    "answered",
    "missed",
    "rejected",
  ]),

  duration: z
    .number()
    .int()
    .nonnegative()
    .optional(),

  notes: z
    .string()
    .trim()
    .max(500)
    .optional(),

  startedAt: z.string(),

  endedAt: z.string().optional(),
});

export const updateCallSchema =
  createCallSchema.partial();