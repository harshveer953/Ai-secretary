import { Router } from "express";
import validate from "../../middlewares/validate.middleware.js";
import { registerSchema } from "../../validations/auth.validation.js";
import { register } from "./auth.controller.js"

const router = Router();

router.post(
  "/register",
  validate(registerSchema),
  register
);


export default router;