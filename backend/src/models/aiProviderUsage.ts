import { DataTypes } from "sequelize";
import sequelize from "../config/database";

const AIProviderUsage = sequelize.define(
    "AIProviderUsage",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },

        provider: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        usageDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },

        requestCount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },

        unavailable: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    },
    {
        tableName: "ai_provider_usage",
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ["provider", "usageDate"],
            },
        ],
    }
);

export default AIProviderUsage;