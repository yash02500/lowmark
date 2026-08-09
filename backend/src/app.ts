import express  from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes"

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'LowMark API running...',
    });
});

export default app;