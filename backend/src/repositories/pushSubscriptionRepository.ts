import PushSubscription from "../models/pushSubscription";

const createSubscription = async (subscriptionData: {
    userId: number;
    endpoint: string;
    p256dh: string;
    auth: string;
}) => {
    return await PushSubscription.create(subscriptionData);
};

const findByEndpoint = async (endpoint: string) => {
    return await PushSubscription.findOne({
        where: {
            endpoint,
        },
    });
};

const findUserSubscriptions = async (userId: number) => {
    return await PushSubscription.findAll({
        where: {
            userId,
        },
    });
};

const deleteByEndpoint = async (
    endpoint: string,
    userId: number
) => {
    return await PushSubscription.destroy({
        where: {
            endpoint,
            userId,
        },
    });
};

export default {
    createSubscription,
    findByEndpoint,
    findUserSubscriptions,
    deleteByEndpoint,
};