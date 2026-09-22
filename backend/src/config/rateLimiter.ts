import rateLimit from "express-rate-limit";

const globalRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,

    limit: 300,

    standardHeaders: "draft-8",
    legacyHeaders: false,

    message: {
        success: false,
        message: "Too many requests. Please try again later.",
    },

    skip: (req) => req.method === "OPTIONS",
});

export default globalRateLimiter;