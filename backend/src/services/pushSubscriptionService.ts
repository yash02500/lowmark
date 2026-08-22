import pushSubscriptionRepository from "../repositories/pushSubscriptionRepository";

const saveSubscription = async (
    userId: number,
    subscription: {
        endpoint: string;
        keys: {
            p256dh: string;
            auth: string;
        };
    }
) => {
    const existingSubscription =
        await pushSubscriptionRepository.findByEndpoint(
            subscription.endpoint
        );

    if (existingSubscription) {
        if (
            existingSubscription.getDataValue("userId") !==
            userId
        ) {
            await existingSubscription.update({
                userId,
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
            });
        }

        return existingSubscription;
    }

    return await pushSubscriptionRepository.createSubscription({
        userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
    });
};

const getUserSubscriptions = async (
    userId: number
) => {
    return await pushSubscriptionRepository.findUserSubscriptions(
        userId
    );
};

const deleteSubscription = async (
    userId: number,
    endpoint: string
) => {
    await pushSubscriptionRepository.deleteByEndpoint(
        endpoint,
        userId
    );

    return true;
};

export default {
    saveSubscription,
    getUserSubscriptions,
    deleteSubscription,
};