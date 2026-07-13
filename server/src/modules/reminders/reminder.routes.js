import { Router } from "express"

import authMiddleware from "../auth/auth.middleware.js"
import validate from "../../middlewares/validate.middleware.js"

import { create } from "./reminder.controller.js"

import { createReminderSchema } from "../../validations/reminder.validation.js"

const router = Router()

router.post("/", authMiddleware, validate(createReminderSchema), create)



export default router

