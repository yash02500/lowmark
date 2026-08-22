import { Router } from "express";
import pushSubscriptionController from "../controllers/pushSubscriptionController";
import verifyToken from "../middlewares/authMiddleware";

const router = Router();

router.post("/", verifyToken, pushSubscriptionController.subscribe);
router.delete("/", verifyToken, pushSubscriptionController.unsubscribe);

export default router;