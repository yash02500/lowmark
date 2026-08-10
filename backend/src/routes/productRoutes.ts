import { Router } from "express";
import productController from "../controllers/productController";
import verifyToken from "../middlewares/authMiddleware";

const router = Router();

router.post("/", verifyToken, productController.createProduct);
router.get("/", verifyToken, productController.getAllProducts);
router.get("/:id", verifyToken, productController.getProductById);
router.delete("/:id", productController.deleteProduct);

export default router;