import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

class AIServiceError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "AIServiceError";
    }
}

const generateProductInsight = async (analytics: {
    currentPrice: number;
    lowestPrice: number;
    highestPrice: number;
    averagePrice: number;
    previousPrice: number | null;
    priceChange: number | null;
    priceChangePercentage: number | null;
    sevenDayChangePercentage: number | null;
    thirtyDayChangePercentage: number | null;
    trend: string;
    priceChangeCount: number;
}) => {
    try {
        const response = await openai.responses.create({
            model: "gpt-5.4-mini",

            instructions: `
You are Lowmark's price intelligence assistant.

Analyze the provided product price statistics and give a short,
clear summary for the user.

Rules:
- Only use the provided data.
- Never invent prices, trends, or facts.
- Do not make a guaranteed prediction about future prices.
- Explain whether the current price looks relatively high, low, or average
  compared with the historical data.
- Mention the recent price trend when available.
- Keep the response concise and useful.
`,

            input: `
Product price analytics:

Current price: ₹${analytics.currentPrice}
Lowest historical price: ₹${analytics.lowestPrice}
Highest historical price: ₹${analytics.highestPrice}
Average price: ₹${analytics.averagePrice}
Previous recorded price: ${analytics.previousPrice !== null
                    ? `₹${analytics.previousPrice}`
                    : "Not available"
                }

Price change: ${analytics.priceChange !== null
                    ? `₹${analytics.priceChange}`
                    : "Not available"
                }

Price change percentage: ${analytics.priceChangePercentage !== null
                    ? `${analytics.priceChangePercentage}%`
                    : "Not available"
                }

7-day change: ${analytics.sevenDayChangePercentage !== null
                    ? `${analytics.sevenDayChangePercentage}%`
                    : "Not available"
                }

30-day change: ${analytics.thirtyDayChangePercentage !== null
                    ? `${analytics.thirtyDayChangePercentage}%`
                    : "Not available"
                }

Trend: ${analytics.trend}
Price change events recorded: ${analytics.priceChangeCount}

Provide a short price summary for the user.
`,
        });

        return response.output_text;
    } catch (error) {
        console.error("OpenAI product insight failed:", error);
        throw new AIServiceError("Unable to generate product insight right now");
    }
};

const generateTrackedProductsInsight = async (
    products: Array<{
        productId: number;
        title: string;
        currentPrice: number;
        lowestPrice: number;
        highestPrice: number;
        averagePrice: number;
        priceChange: number | null;
        priceChangePercentage: number | null;
        sevenDayChangePercentage: number | null;
        thirtyDayChangePercentage: number | null;
        trend: string;
        priceChangeCount: number;
        availability: string;
        targetPrice: number | null;
        targetStatus:
        | "reached"
        | "close"
        | "not_set"
        | "above_target";
    }>
) => {
    try {
        const response = await openai.responses.create({
            model: "gpt-5.4-mini",

            instructions: `
You are Lowmark's price intelligence assistant.

Summarize the user's tracked products using only the
provided data.

Rules:
- Never invent product information or prices.
- Never invent a price trend.
- Do not make guaranteed predictions.
- Highlight meaningful price drops and increases.
- Highlight products that reached or are close to their target price.
- Highlight out-of-stock products.
- Mention stable products when useful.
- Prioritize the most important products first.
- Keep the summary concise and easy to understand.
`,

            input: `
Here is the user's tracked product data:

${JSON.stringify(products, null, 2)}

Create a concise summary of the user's tracked products.

Mention:
1. How many products are being tracked.
2. Important price drops.
3. Important price increases.
4. Products close to or below their target price.
5. Out-of-stock products.
6. Any other particularly useful observation.

Do not simply list every field.
Turn the data into a useful summary for the user.
`,
        });

        return response.output_text;
    } catch (error) {
        console.error("OpenAI tracked products insight failed:", error);
        throw new AIServiceError("Unable to generate tracked products insight right now");
    }
};

const generateAttentionSummary = async (
    attentionItems: Array<{
        productId: number;
        title: string;
        type: string;
        priority: string;
        message: string;
        currentPrice: number;
        lowestPrice?: number;
        targetPrice?: number;
        percentageAboveTarget?: number;
        priceChangePercentage?: number | null;
    }>
) => {
    if (attentionItems.length === 0) {
        return "None of your tracked products currently require special attention.";
    }

    try {
        const response = await openai.responses.create({
            model: "gpt-5.4-mini",

            instructions: `
You are Lowmark's price intelligence assistant.

Summarize which tracked products currently deserve the user's attention.

Rules:
- Only use the provided attention items.
- Never invent prices or events.
- Do not make guaranteed predictions.
- Prioritize high-priority items before medium-priority items.
- Explain why each product deserves attention.
- Keep the response concise.
- Do not repeat every field from the data.
`,

            input: `
Products requiring attention:

${JSON.stringify(
                attentionItems,
                null,
                2
            )}

Create a concise prioritized summary.

Mention the most important products first.
If there are no items, say that nothing currently requires attention.
`,
        });

        return response.output_text;
    } catch (error) {
        console.error("OpenAI attnstion insight failed:", error);
        throw new AIServiceError("Unable to generate product attention insight right now");
    }
};

export {
    AIServiceError,
}

export default {
    generateProductInsight,
    generateTrackedProductsInsight,
    generateAttentionSummary,
};