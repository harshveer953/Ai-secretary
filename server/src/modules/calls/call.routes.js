import { Router } from "express";

import authMiddleware from "../auth/auth.middleware.js"
import validate from "../../middlewares/validate.middleware.js"

import { create, getAll, getById, update, remove } from "./call.controller.js";

import { createCallSchema, updateCallSchema } from "../../validations/call.validation.js";

const router = Router();

router.post("/", authMiddleware, validate(createCallSchema), create)

router.get("/" , authMiddleware, getAll)

router.get("/:id", authMiddleware , getById)

router.patch("/:id", authMiddleware, validate(updateCallSchema), update)

router.delete("/:id", authMiddleware, remove)


export default router;