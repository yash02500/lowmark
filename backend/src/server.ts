import "dotenv/config"
import "./models/associations";
import app from "./app";
import sequelize from "./config/database";
import startPriceCheckJob from "./jobs/priceCheckJob";

const PORT =  process.env.PORT || 5000;

const startServer = async () => {
    try{
        await sequelize.authenticate();
        console.log("Database connected successfully");

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
            startPriceCheckJob();
        });
    } catch (error) {
        console.log("Unable to connect to database", error);
    }
};

startServer();