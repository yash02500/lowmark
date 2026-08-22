import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import aiProviderState from "./aiProviderState";
import dotenv from "dotenv";

dotenv.config();
const AI_ENABLED = process.env.AI_ENABLED === "true";
const openRouterApiKey = process.env.OPENROUTER_API_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;

const openRouter = openRouterApiKey
    ? new OpenAI({
          apiKey: openRouterApiKey,
          baseURL: "https://openrouter.ai/api/v1",
      })
    : null;

const gemini = geminiApiKey
    ? new GoogleGenerativeAI(geminiApiKey)
    : null;

class AIServiceError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "AIServiceError";
    }
}

const generateWithOpenRouter = async (
    instructions: string,
    input: string
): Promise<string> => {
    if (!openRouter) {
        throw new AIServiceError(
            "OpenRouter API key is not configured"
        );
    }

    const response = await openRouter.responses.create(
        {
            model: "openrouter/free",
            instructions,
            input,
        },
        {
            timeout: 30000,
        }
    );

    if (!response.output_text) {
        throw new AIServiceError(
            "OpenRouter returned an empty response"
        );
    }

    return response.output_text;
};

const generateWithGemini = async (
    instructions: string,
    input: string
): Promise<string> => {
    if (!gemini) {
        throw new AIServiceError(
            "Gemini API key is not configured"
        );
    }

    const model = gemini.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: instructions,
    });

    const result = await model.generateContent(input);

    const text = result.response.text();

    if (!text) {
        throw new AIServiceError(
            "Gemini returned an empty response"
        );
    }

    return text;
};

const generateAIResponse = async (
    instructions: string,
    input: string
): Promise<string> => {

    if (!AI_ENABLED) {
        return "AI insights are currently disabled.";
    }

    // Check whether OpenRouter is still available
    if (await aiProviderState.canUseOpenRouter()) {
        try {
            console.log("Trying OpenRouter...");

            // Count the attempt because OpenRouter's
            // failed requests can still consume the
            // free daily quota.
            const requestCount = await aiProviderState.recordOpenRouterRequest();

            console.log(`OpenRouter usage: ${requestCount}/50`);

            const response =
                await generateWithOpenRouter(
                    instructions,
                    input
                );

            console.log(
                "OpenRouter response received"
            );

            return response;

        } catch (openRouterError: any) {

            console.error(
                "OpenRouter failed:",
                openRouterError
            );

            // 429 means rate limit / quota
            if (
                openRouterError?.status === 429 ||
                openRouterError?.statusCode === 429
            ) {
                await aiProviderState.markOpenRouterUnavailable();
            }

            console.log(
                "Falling back to Gemini..."
            );
        }
    } else {
        console.log(
            "OpenRouter unavailable. Skipping directly to Gemini."
        );
    }

    // Gemini fallback
    try {
        const response =
            await generateWithGemini(
                instructions,
                input
            );

        console.log(
            "Gemini response received"
        );

        return response;

    } catch (geminiError) {

        console.error(
            "Gemini fallback failed:",
            geminiError
        );

        throw new AIServiceError(
            "Unable to generate AI insight right now"
        );
    }
};

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
    const instructions = `
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
- All prices must be written using the Indian rupee symbol ₹.
- Never use $, USD, dollars, or any other currency symbol.
`;

    const input = `
Product price analytics:

Current price: ₹${analytics.currentPrice}
Lowest historical price: ₹${analytics.lowestPrice}
Highest historical price: ₹${analytics.highestPrice}
Average price: ₹${analytics.averagePrice}
Previous recorded price: ${
        analytics.previousPrice !== null
            ? `₹${analytics.previousPrice}`
            : "Not available"
    }

Price change: ${
        analytics.priceChange !== null
            ? `₹${analytics.priceChange}`
            : "Not available"
    }3

Price change percentage: ${
        analytics.priceChangePercentage !== null
            ? `${analytics.priceChangePercentage}%`
            : "Not available"
    }

7-day change: ${
        analytics.sevenDayChangePercentage !== null
            ? `${analytics.sevenDayChangePercentage}%`
            : "Not available"
    }

30-day change: ${
        analytics.thirtyDayChangePercentage !== null
            ? `${analytics.thirtyDayChangePercentage}%`
            : "Not available"
    }

Trend: ${analytics.trend}
Price change events recorded: ${analytics.priceChangeCount}

Provide a short price summary for the user.
`;

    return generateAIResponse(
        instructions,
        input
    );
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
    const instructions = `
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
- All prices must be written using the Indian rupee symbol ₹.
- Never use $, USD, dollars, or any other currency symbol.
`;

    const input = `
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
`;

    return generateAIResponse(
        instructions,
        input
    );
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

    const instructions = `
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
`;

    const input = `
Products requiring attention:

${JSON.stringify(
    attentionItems,
    null,
    2
)}

Create a concise prioritized summary.

Mention the most important products first.
If there are no items, say that nothing currently requires attention.
`;

    return generateAIResponse(
        instructions,
        input
    );
};

export {
    AIServiceError,
};

export default {
    generateProductInsight,
    generateTrackedProductsInsight,
    generateAttentionSummary,
};