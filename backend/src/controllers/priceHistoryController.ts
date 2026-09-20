import { Request, Response } from "express";
import priceHistoryService from "../services/priceHistoryService";
import { productIdParamSchema, recordPriceSchema } from "../validations/priceHistoryValidation";

const recordPrice = async (req: Request, res: Response) => {
    try {
        const productIdResult = productIdParamSchema.safeParse(req.params);

        if (!productIdResult.success) {
            const errors = productIdResult.error.issues.map(err => ({
                field: err.path.join('.'),
                message: err.message,
            }));

            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors,
            });
        }

        const validationResult = recordPriceSchema.safeParse(req.body);

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

        const { productId } = productIdResult.data;
        const { price, recordedAt } = validationResult.data;

        const result = await priceHistoryService.recordPrice(
            productId,
            price,
            recordedAt
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
        const validationResult = productIdParamSchema.safeParse(req.params);

        if (!validationResult.success) {
            const errors =
                validationResult.error.issues.map((err) => ({
                    field: err.path.join("."),
                    message: err.message,
                }));

            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors,
            });
        }

        const { productId } = validationResult.data;
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
        const validationResult = productIdParamSchema.safeParse(req.params);

        if (!validationResult.success) {
            const errors =
                validationResult.error.issues.map((err) => ({
                    field: err.path.join("."),
                    message: err.message,
                }));

            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors,
            });
        }

        const { productId } = validationResult.data;
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