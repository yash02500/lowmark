import { Router } from "express";
import authController from "../controllers/authController";
import verifyToken from "../middlewares/authMiddleware";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", verifyToken, authController.getMe);
router.patch("/me", verifyToken, authController.updateMe);
router.get("/verify-email", authController.verifyEmail);
router.post("/resend-verification", verifyToken,authController.resendVerification);
router.post("/refresh-token", authController.refreshToken);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/logout", authController.logout);

export default router;