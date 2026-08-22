import { Request, Response } from "express";
import pushSubscriptionService from "../services/pushSubscriptionService";

const subscribe = async (req: Request, res: Response) => {
    try {
        const userId = req.userId!;
        const { endpoint, keys } = req.body;

        if (
            !endpoint ||
            !keys?.p256dh ||
            !keys?.auth
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid push subscription",
            });
        }

        const subscription =
            await pushSubscriptionService.saveSubscription(
                userId,
                {
                    endpoint,
                    keys,
                }
            );

        return res.status(201).json({
            success: true,
            message: "Push subscription saved successfully",
            data: subscription,
        });
    } catch (error: any) {
        console.error(
            "Save push subscription error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to save push subscription",
        });
    }
};

const unsubscribe = async (req: Request, res: Response) => {
    try {
        const userId = req.userId!;
        const { endpoint } = req.body;

        if (!endpoint) {
            return res.status(400).json({
                success: false,
                message: "Endpoint is required",
            });
        }

        await pushSubscriptionService.deleteSubscription(
            userId,
            endpoint
        );

        return res.status(200).json({
            success: true,
            message: "Push subscription removed successfully",
        });
    } catch (error: any) {
        console.error(
            "Delete push subscription error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to remove push subscription",
        });
    }
};

export default {
    subscribe,
    unsubscribe,
};