import { Router } from "express";

import healthRoutes from "./health.routes.js"

// Future Modules
import authRoutes from "../modules/auth/auth.routes.js";
import userRoutes from "../modules/users/user.routes.js";
import callRoutes from "../modules/calls/call.routes.js";
import contactRoutes from "../modules/contacts/contact.routes.js";
import dashboardRoutes from "../modules/dashboard/dashboard.routes.js";
import appointmentRoutes from "../modules/appointments/appointment.routes.js"
import reminderRoutes from "../modules/reminders/reminder.routes.js"



const router = Router()

router.use("/" , healthRoutes)

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/calls", callRoutes);
router.use("/contacts", contactRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/appointments", appointmentRoutes)
router.use("/reminders", reminderRoutes)

export default router