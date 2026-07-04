import { Router } from "express";

import authMiddleware from "../auth/auth.middleware.js"
import roleMiddleware from "../../middlewares/role.middleware.js";
import ROLES from "../../constants/roles.js";

import validate from "../../middlewares/validate.middleware.js"
import { updateUserRoleSchema } from "../../validations/user.validation.js";

import { getAllUsers, getUser, updateRole , removeUser } from "./user.controller.js";

const router = Router();

router.get("/", authMiddleware, roleMiddleware(ROLES.ADMIN),getAllUsers)
router.get("/:id", authMiddleware, roleMiddleware(ROLES.ADMIN), getUser)
router.patch("/:id/role" , authMiddleware, roleMiddleware(ROLES.ADMIN), validate(updateUserRoleSchema), updateRole)
router.delete("/:id", authMiddleware, roleMiddleware(ROLES.ADMIN), removeUser)


export default router;