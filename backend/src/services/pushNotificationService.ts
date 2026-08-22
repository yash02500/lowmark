import webpush from "web-push";
import pushSubscriptionRepository from "../repositories/pushSubscriptionRepository";

const publicKey = process.env.VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const subject = process.env.VAPID_SUBJECT;

if (!publicKey || !privateKey || !subject) {
    throw new Error(
        "VAPID configuration is missing"
    );
}

webpush.setVapidDetails(
    subject,
    publicKey,
    privateKey
);

interface SendPushNotificationData {
    userId: number;
    title: string;
    message: string;
    url: string;
}

const sendPushNotification = async (data: SendPushNotificationData) => {
    const subscriptions = await pushSubscriptionRepository.findUserSubscriptions(data.userId);

    if (subscriptions.length === 0) {
        console.log(
            `No push subscriptions found for user ${data.userId}`
        );

        return;
    }

    const payload = JSON.stringify({
        title: data.title,
        message: data.message,
        url: data.url,
    });

    for (const subscription of subscriptions) {
        const endpoint = subscription.getDataValue("endpoint");
        const p256dh = subscription.getDataValue("p256dh");
        const auth = subscription.getDataValue("auth");

        try {
            await webpush.sendNotification(
                {
                    endpoint,
                    keys: {
                        p256dh,
                        auth,
                    },
                },
                payload
            );

            console.log(
                `Push notification sent to user ${data.userId}`
            );
        } catch (error: any) {
            console.error(
                `Push notification failed for user ${data.userId}:`,
                error.message
            );

            // 404/410 means the browser subscription
            // is no longer valid.
            if (
                error.statusCode === 404 ||
                error.statusCode === 410
            ) {
                await pushSubscriptionRepository.deleteByEndpoint(
                    endpoint,
                    data.userId
                );

                console.log(
                    "Removed invalid push subscription"
                );
            }
        }
    }
};

export default {
    sendPushNotification,
};