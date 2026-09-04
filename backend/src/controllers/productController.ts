import { Request, Response } from "express";
import { z } from "zod";
import productService from "../services/productService";
import { createProductSchema, productIdParamSchema } from "../validations/productValidation";

const createProduct = async (req: Request, res: Response) => {
    try {
        const validationResult = createProductSchema.safeParse(req.body);

        if (!validationResult.success) {
            const errors = validationResult.error.issues.map(err => ({
                field: err.path.join('.'),
                message: err.message,
            }));

            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors,
            });
        }
        
        const product = await productService.createProduct(validationResult.data);

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: product,
        });
    } catch (error: any) {
        return res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};

const getProductById = async (req: Request, res: Response) => {
    try {
        const validationResult = productIdParamSchema.safeParse(req.params);

        if (!validationResult.success) {
            const errors = validationResult.error.issues.map(err => ({
                field: err.path.join('.'),
                message: err.message,
            }));

            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors,
            });
        }

        const product = await productService.getProductById(validationResult.data.id);

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
        const validationResult = productIdParamSchema.safeParse(req.params);

        if (!validationResult.success) {
            const errors = validationResult.error.issues.map(err => ({
                field: err.path.join('.'),
                message: err.message,
            }));

            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors,
            });
        }

        await productService.deleteProduct(validationResult.data.id);

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