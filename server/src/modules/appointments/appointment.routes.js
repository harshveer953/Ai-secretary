import { Router } from "express";

import authMiddleware from "../auth/auth.middleware.js"
import validate from "../../middlewares/validate.middleware.js"

import { create, getAll, getById, update, remove, status, getUpcoming, stats } from "./appointment.controller.js"

import {
    createAppointmentSchema,
    updateAppointmentSchema,
    updateAppointmentStatusSchema,
} from "../../validations/appointment.validation.js"

const router = Router();

router.post("/", authMiddleware, validate(createAppointmentSchema), create);

router.get("/", authMiddleware, getAll);

router.get("/stats", authMiddleware, stats)

router.get("/upcoming", authMiddleware, getUpcoming);

router.get("/:id", authMiddleware, getById);

router.patch("/:id", authMiddleware, validate(updateAppointmentSchema), update);

router.patch(
  "/:id/status",
  authMiddleware,
  validate(updateAppointmentStatusSchema),
  status
);

router.delete("/:id", authMiddleware, remove);



export default router;