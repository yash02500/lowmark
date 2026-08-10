import { Router } from "express";
import userProductController from "../controllers/userProductController";
import verifyToken from "../middlewares/authMiddleware";

const router = Router();

router.post("/", verifyToken, userProductController.trackProduct);
router.get("/", verifyToken, userProductController.getTrackedProducts);
router.get("/:id", verifyToken, userProductController.getTrackedProductById);
router.delete("/:id", verifyToken, userProductController.untrackProduct);

export default router;