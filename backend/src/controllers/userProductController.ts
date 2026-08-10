import { Request, Response } from "express";
import userProductService from "../services/userProductService";

const trackProduct = async (req: Request, res: Response) => {
    try {
        const userId = req.userId!;

        const { productId, targetPrice } = req.body;

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
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const getTrackedProducts = async (req: Request, res: Response) => {
    try {
        const userId = req.userId!;

        const products =
            await userProductService.getTrackedProducts(userId);

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
        const id = Number(req.params.id);

        const product =
            await userProductService.getTrackedProductById(
                id,
                userId
            );

        return res.status(200).json({
            success: true,
            message: "Tracked product fetched successfully",
            data: product,
        });
    } catch (error: any) {
        return res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};

const untrackProduct = async (req: Request, res: Response) => {
    try {
        const userId = req.userId!;
        const id = Number(req.params.id);

        await userProductService.untrackProduct(
            id,
            userId
        );

        return res.status(200).json({
            success: true,
            message: "Product untracked successfully",
        });
    } catch (error: any) {
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
};