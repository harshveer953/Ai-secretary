import { Router } from "express"

import authMiddleware from "../auth/auth.middleware.js"
import validate from "../../middlewares/validate.middleware.js"

import { create, getAll, getById, update, remove } from "./reminder.controller.js"

import { createReminderSchema, updateReminderSchema } from "../../validations/reminder.validation.js"

const router = Router()

router.post("/", authMiddleware, validate(createReminderSchema), create)
router.get("/", authMiddleware, getAll)
router.get("/:id", authMiddleware, getById)
router.patch("/:id", authMiddleware, validate(updateReminderSchema), update)
router.delete("/:id", authMiddleware, remove)

export default router


