import { Router } from "express";

import authMiddleware from "../auth/auth.middleware.js"
import validate from "../../middlewares/validate.middleware.js"

import { create, getAll, getById, update, remove, favorite } from "./contact.controller.js";
import { createContactSchema, toggleFavoriteSchema, updateContactSchema } from "../../validations/contact.validation.js";


const router = Router();

router.post("/", authMiddleware, validate(createContactSchema), create)
router.get("/", authMiddleware, getAll)
router.get("/:id", authMiddleware, getById)
router.patch("/:id", authMiddleware, validate(updateContactSchema), update)
router.delete("/:id", authMiddleware, remove )
router.patch("/:id/favorite", authMiddleware, validate(toggleFavoriteSchema), favorite)


export default router;