import { DataTypes } from "sequelize";
import sequelize from "../config/database";

const PriceHistory = sequelize.define("PriceHistory", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },

    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
    },

    recordedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
},
    {
        tableName: "price_history",
    }
);

export default PriceHistory;