import { Router } from "express";
import notificationController from "../controllers/notificationController";
import verifyToken from "../middlewares/authMiddleware";

const router = Router();

router.get("/", verifyToken, notificationController.getNotifications);
router.patch("/read-all", verifyToken, notificationController.markAllAsRead);
router.patch("/:id/read", verifyToken, notificationController.markAsRead);
router.delete("/:id", verifyToken, notificationController.deleteNotification);
export default router;