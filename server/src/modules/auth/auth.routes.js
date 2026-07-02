import { Router } from "express";
import validate from "../../middlewares/validate.middleware.js";
import { registerSchema , loginSchema } from "../../validations/auth.validation.js";
import { 
  register, 
  login,
  getCurrentUser,
  logout,
  refreshAccessToken} from "./auth.controller.js"
import authMiddleware from "./auth.middleware.js";

const router = Router();

router.post(  "/register",  validate(registerSchema), register);
router.post("/login", validate(loginSchema) , login)
router.get("/me", authMiddleware, getCurrentUser)
router.post("/logout", authMiddleware, logout)
router.post("/refresh-token", refreshAccessToken)


router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Auth routes working",
  });
});

export default router;