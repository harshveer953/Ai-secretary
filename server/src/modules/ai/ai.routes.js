import { Router } from "express"

import { chat } from "./ai.controller.js"

import authMiddleware from "../auth/auth.middleware.js";


const router = Router()

router.post("/chat", authMiddleware, chat)

export default router;