import { Router } from "express"

import {
    getStats,
} from "./dashboard.controller.js"

import authMiddleware from "../auth/auth.middleware.js";

const router = Router()

router.get("/stats", authMiddleware, getStats)

export default router;