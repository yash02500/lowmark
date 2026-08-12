export type SupportedPlatform = "amazon" | "flipkart";

const detectPlatform = (url: string): SupportedPlatform => {
    let hostname: string;

    try {
        hostname = new URL(url).hostname.toLowerCase();
    } catch {
        throw new Error("Invalid product URL");
    }

    if (
        hostname === "amazon.in" ||
        hostname.endsWith(".amazon.in")
    ) {
        return "amazon";
    }

    if (
        hostname === "flipkart.com" ||
        hostname.endsWith(".flipkart.com")
    ) {
        return "flipkart";
    }

    throw new Error("Unsupported platform");
};

export default detectPlatform;