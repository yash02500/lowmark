"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const userProductRoutes_1 = __importDefault(require("./routes/userProductRoutes"));
const priceHistoryRoutes_1 = __importDefault(require("./routes/priceHistoryRoutes"));
const notificationRoute_1 = __importDefault(require("./routes/notificationRoute"));
const pushSubscriptionRoutes_1 = __importDefault(require("./routes/pushSubscriptionRoutes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use("/api/auth", authRoutes_1.default);
app.use("/api/products", productRoutes_1.default, priceHistoryRoutes_1.default);
app.use("/api/user-products", userProductRoutes_1.default);
app.use("/api/notifications", notificationRoute_1.default);
app.use("/api/push-subscriptions", pushSubscriptionRoutes_1.default);
// Root api endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'LowMark API running...',
    });
});
exports.default = app;
