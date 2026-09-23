import { Router } from "express";
import authController from "../controllers/authController";
import verifyToken from "../middlewares/authMiddleware";
import { authRateLimiter } from "../config/rateLimiter";

const router = Router();

router.post("/register", authRateLimiter, authController.register);
router.post("/login", authRateLimiter, authController.login);
router.get("/me", verifyToken, authController.getMe);
router.patch("/me", verifyToken, authController.updateMe);
router.get("/verify-email", authController.verifyEmail);
router.post("/resend-verification", verifyToken, authRateLimiter, authController.resendVerification);
router.post("/refresh-token", authController.refreshToken);
router.post("/forgot-password", authRateLimiter, authController.forgotPassword);
router.post("/reset-password", authRateLimiter, authController.resetPassword);
router.post("/logout", authController.logout);

export default router;