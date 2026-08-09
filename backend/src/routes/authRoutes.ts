import { Router } from "express";
import authController from "../controllers/authController";
import verifyToken from "../middlewares/authMiddleware";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", verifyToken, authController.getMe);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authController.logout);

export default router;