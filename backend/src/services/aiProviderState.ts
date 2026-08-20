import aiProviderUsageRepository from "../repositories/aiProviderUsageRepository";

const OPENROUTER_DAILY_LIMIT = 50;

const getCurrentDate = () => {
    return new Date()
        .toISOString()
        .split("T")[0];
};

const canUseOpenRouter = async () => {
    const usageDate = getCurrentDate();

    let usage =
        await aiProviderUsageRepository.getUsage(
            "openrouter",
            usageDate
        );

    if (!usage) {
        usage =
            await aiProviderUsageRepository.createUsage(
                "openrouter",
                usageDate
            );
    }

    const requestCount =
        Number(usage.get("requestCount"));

    const unavailable =
        Boolean(usage.get("unavailable"));

    if (unavailable) {
        return false;
    }

    if (
        requestCount >=
        OPENROUTER_DAILY_LIMIT
    ) {
        await aiProviderUsageRepository.markUnavailable(
            "openrouter",
            usageDate
        );

        return false;
    }

    return true;
};

const recordOpenRouterRequest = async () => {
    const usageDate = getCurrentDate();

    const usage =
        await aiProviderUsageRepository.incrementRequestCount(
            "openrouter",
            usageDate
        );

    const requestCount =
        Number(usage.get("requestCount"));

    if (
        requestCount >=
        OPENROUTER_DAILY_LIMIT
    ) {
        await aiProviderUsageRepository.markUnavailable(
            "openrouter",
            usageDate
        );
    }

    return requestCount;
};

const markOpenRouterUnavailable = async () => {
    const usageDate = getCurrentDate();

    await aiProviderUsageRepository.markUnavailable(
        "openrouter",
        usageDate
    );
};

const getOpenRouterState = async () => {
    const usageDate = getCurrentDate();

    const usage =
        await aiProviderUsageRepository.getUsage(
            "openrouter",
            usageDate
        );

    if (!usage) {
        return {
            requestCount: 0,
            dailyLimit: OPENROUTER_DAILY_LIMIT,
            unavailable: false,
        };
    }

    return {
        requestCount: Number(
            usage.get("requestCount")
        ),
        dailyLimit: OPENROUTER_DAILY_LIMIT,
        unavailable: Boolean(
            usage.get("unavailable")
        ),
    };
};

export default {
    canUseOpenRouter,
    recordOpenRouterRequest,
    markOpenRouterUnavailable,
    getOpenRouterState,
};