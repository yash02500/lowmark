const getCheckIntervalMinutes = (params: {
    isNew: boolean;
    priceChangeCount: number;
    targetPriceClose?: boolean;
    stableForWeeks: boolean;
    isSalePeriod?: boolean;
    trackingState: string;
}) => {
    const {
        isNew,
        priceChangeCount,
        targetPriceClose,
        stableForWeeks,
        isSalePeriod = false,
        trackingState,
    } = params;

    // Discontinued products
    if (trackingState === "discontinued") {
        return 3 * 24 * 60;
    }

    // Out of stock products
    if (trackingState === "out_of_stock") {
        return 6 * 60;
    }

    // Major sale period
    if (isSalePeriod) {
        return 15;
    }

    // Newly added products
    if (isNew) {
        return 30;
    }

    // Target price is close to current price
    if (targetPriceClose) {
        return 15;
    }

    // Frequently changing price
    if (priceChangeCount >= 3) {
        return 60;
    }

    // Stable for weeks
    if(stableForWeeks) {
        return 24 * 60;
    }

    // Stable product
    return 12 * 60;
};

const calculateNextCheckAt = (
    intervalMinutes: number,
    from: Date = new Date()
) => {
    return new Date(
        from.getTime() + intervalMinutes * 60 * 1000
    );
};

const isTargetPriceClose = (
    currentPrice: number,
    targetPrices: number[]
) => {
    if (targetPrices.length === 0) {
        return false;
    }

    return targetPrices.some((targetPrice) => {
        if (targetPrice >= currentPrice) {
            return true;
        }

        const difference = currentPrice - targetPrice;
        const percentageDifference =
            difference / currentPrice;

        return percentageDifference <= 0.05;
    });
};

export default {
    getCheckIntervalMinutes,
    calculateNextCheckAt,
    isTargetPriceClose,
};