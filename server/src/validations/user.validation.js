import { z } from "zod";
import ROLES from "../constants/roles.js";

export const updateUserRoleSchema = z.object({
  role: z.enum([
    ROLES.ADMIN,
    ROLES.USER,
  ]),
});