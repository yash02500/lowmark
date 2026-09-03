import { Request, Response } from "express";
import userProductService from "../services/userProductService";
import z from "zod";
import productInsightService from "../services/productInsightService";
import { trackProductSchema, userProductIdParamSchema } from "../validations/userProductValidation";

const trackProduct = async (req: Request, res: Response) => {
    try {
        const userId = req.userId!;
        const validationResult = trackProductSchema.safeParse(req.body);

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

        const { productId, targetPrice } = validationResult.data;

        const userProduct = await userProductService.trackProduct(
            userId,
            Number(productId),
            targetPrice
        );

        return res.status(201).json({
            success: true,
            message: "Product tracked successfully",
            data: userProduct,
        });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                message: error.issues[0].message,
            });
        }

        return res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};

const getTrackedProducts = async (req: Request, res: Response) => {
    try {
        const userId = req.userId!;
        const products = await userProductService.getTrackedProducts(userId);

        return res.status(200).json({
            success: true,
            message: "Tracked products fetched successfully",
            data: products,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getTrackedProductById = async (req: Request, res: Response) => {
    try {
        const userId = req.userId!;

        const validationResult = userProductIdParamSchema.safeParse(req.params);

        if (!validationResult.success) {
            const errors = validationResult.error.issues.map((err: any) => ({
                field: err.path.join('.'),
                message: err.message,
            }));

            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors,
            });
        }

        const { id } = validationResult.data;
        const product = await userProductService.getTrackedProductById(id, userId);

        return res.status(200).json({
            success: true,
            message: "Tracked product fetched successfully",
            data: product,
        });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                message: error.issues[0].message,
            });
        }

        return res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};

const untrackProduct = async (req: Request, res: Response) => {
    try {
        const userId = req.userId!;
        const validationResult = userProductIdParamSchema.safeParse(req.params);

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
        const { id } = validationResult.data;

        await userProductService.untrackProduct(
            id,
            userId
        );

        return res.status(200).json({
            success: true,
            message: "Product untracked successfully",
        });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                message: error.issues[0].message,
            });
        }

        return res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};

const getInsights = async (req: Request, res: Response) => {
    try {
        const userId = req.userId!;
        const insights = await productInsightService.getUserProductsInsight(userId);

        return res.status(200).json({
            success: true,
            message: "Product insights generated successfully",
            data: insights,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getAttention = async (req: Request, res: Response) => {
    try {
        const userId = req.userId!;
        const attention = await productInsightService.getUserProductAttention(userId);

        return res.status(200).json({
            success: true,
            message: "Product attention insights generated successfully",
            data: attention,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getProductInsightById = async (req: Request, res: Response) => {
    try {
        const userId = req.userId!;
        const validationResult = userProductIdParamSchema.safeParse(req.params);

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
        const { id } = validationResult.data;
        const insight = await productInsightService.getUserProductInsightById(id, userId);

        return res.status(200).json({
            success: true,
            message: "Product summary generated successfully",
            data: insight,
        });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                message: error.issues[0].message,
            });
        }

        return res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};

export default {
    trackProduct,
    getTrackedProducts,
    getTrackedProductById,
    untrackProduct,
    getInsights,
    getAttention,
    getProductInsightById,
};