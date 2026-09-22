import express  from "express";
import corsMiddleware from "./config/cors";
import authRoutes from "./routes/authRoutes"
import productRoutes from "./routes/productRoutes";
import userProductRoutes from "./routes/userProductRoutes";
import priceHistoryRoutes from "./routes/priceHistoryRoutes";
import notificationRoute from "./routes/notificationRoute";
import pushSubscriptionRoutes from "./routes/pushSubscriptionRoutes";

const app = express();
app.use(corsMiddleware);
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes, priceHistoryRoutes);
app.use("/api/user-products", userProductRoutes);
app.use("/api/notifications", notificationRoute);
app.use("/api/push-subscriptions", pushSubscriptionRoutes);

// Root api endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'LowMark API running...',
    });
});

export default app;