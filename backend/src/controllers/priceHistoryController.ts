import { Request, Response } from "express";
import priceHistoryService from "../services/priceHistoryService";

const recordPrice = async (req: Request, res: Response) => {
    try {
        const productId = Number(req.params.productId);
        const { price, recordedAt } = req.body;

        const result = await priceHistoryService.recordPrice(
            productId,
            Number(price),
            recordedAt ? new Date(recordedAt) : undefined
        );

        return res.status(200).json({
            success: true,
            message: result.recorded
                ? "Price recorded successfully"
                : "Price unchanged; no new history record created",
            data: result.priceHistory,
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const getPriceHistory = async (req: Request, res: Response) => {
    try {
        const productId = Number(req.params.productId);
        const userId = req.userId!;

        const priceHistory = await priceHistoryService.getPriceHistory(productId, userId);

        return res.status(200).json({
            success: true,
            message: "Price history fetched successfully",
            data: priceHistory,
        });
    } catch (error: any) {
        return res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};

const getLatestPrice = async (req: Request, res: Response) => {
    try {
        const productId = Number(req.params.productId);
        const userId = req.userId!;

        const latestPrice = await priceHistoryService.getLatestPrice(productId, userId);

        return res.status(200).json({
            success: true,
            message: "Latest price fetched successfully",
            data: latestPrice,
        });
    } catch (error: any) {
        return res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};

export default {
    recordPrice,
    getPriceHistory,
    getLatestPrice,
};