import { Router } from "express";
import userProductController from "../controllers/userProductController";
import verifyToken from "../middlewares/authMiddleware";

const router = Router();

router.post("/", verifyToken, userProductController.trackProduct);
router.get("/", verifyToken, userProductController.getTrackedProducts);
router.get("/insights", verifyToken, userProductController.getInsights);
router.get("/attention", verifyToken, userProductController.getAttention);
router.get("/:id/insight", verifyToken, userProductController.getProductInsightById);
router.get("/:id", verifyToken, userProductController.getTrackedProductById);
router.delete("/:id", verifyToken, userProductController.untrackProduct);

export default router;