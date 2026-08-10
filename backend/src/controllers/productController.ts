import { Request, Response } from "express";
import productService from "../services/productService";

const createProduct = async (req: Request, res: Response) => {
    try {
        const product = await productService.createProduct(req.body);

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: product,
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const getProductById = async (req: Request, res: Response) => {
    try {
        const productId = Number(req.params.id);

        const product = await productService.getProductById(productId);

        return res.status(200).json({
            success: true,
            message: "Product fetched successfully",
            data: product,
        });
    } catch (error: any) {
        return res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};

const getAllProducts = async (_req: Request, res: Response) => {
    try {
        const products = await productService.getAllProducts();

        return res.status(200).json({
            success: true,
            message: "Products fetched successfully",
            data: products,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const deleteProduct = async (req: Request, res: Response) => {
    try {
        const productId = Number(req.params.id);

        await productService.deleteProduct(productId);

        return res.status(200).json({
            success: true,
            message: "Product deleted successfully",
        });
    } catch (error: any) {
        return res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};

export default {
    createProduct,
    getProductById,
    getAllProducts,
    deleteProduct,
};