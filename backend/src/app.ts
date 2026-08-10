import express  from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes"
import productRoutes from "./routes/productRoutes";
import userProductRoutes from "./routes/userProductRoutes";
import priceHistoryRoutes from "./routes/priceHistoryRoutes";
const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes, priceHistoryRoutes);
app.use("/api/user-products", userProductRoutes);

app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'LowMark API running...',
    });
});

export default app;