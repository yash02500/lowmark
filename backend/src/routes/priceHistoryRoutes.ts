import { Router } from "express";
import priceHistoryController from "../controllers/priceHistoryController";
import verifyToken from "../middlewares/authMiddleware";

const router = Router();

router.post("/:productId/price-history", verifyToken, priceHistoryController.recordPrice);
router.get("/:productId/price-history", verifyToken, priceHistoryController.getPriceHistory);
router.get("/:productId/price-history/latest", verifyToken, priceHistoryController.getLatestPrice);

export default router;