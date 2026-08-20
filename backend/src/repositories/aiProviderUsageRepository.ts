import AIProviderUsage from "../models/aiProviderUsage";

const getUsage = async (
    provider: string,
    usageDate: string
) => {
    return await AIProviderUsage.findOne({
        where: {
            provider,
            usageDate,
        },
    });
};

const createUsage = async (
    provider: string,
    usageDate: string
) => {
    return await AIProviderUsage.create({
        provider,
        usageDate,
        requestCount: 0,
        unavailable: false,
    });
};

const incrementRequestCount = async (
    provider: string,
    usageDate: string
) => {
    let usage = await getUsage(
        provider,
        usageDate
    );

    if (!usage) {
        usage = await createUsage(
            provider,
            usageDate
        );
    }

    await usage.increment("requestCount");
    await usage.reload();

    return usage;
};

const markUnavailable = async (
    provider: string,
    usageDate: string
) => {
    let usage = await getUsage(
        provider,
        usageDate
    );

    if (!usage) {
        usage = await createUsage(
            provider,
            usageDate
        );
    }

    await usage.update({
        unavailable: true,
    });

    return usage;
};

export default {
    getUsage,
    createUsage,
    incrementRequestCount,
    markUnavailable,
};