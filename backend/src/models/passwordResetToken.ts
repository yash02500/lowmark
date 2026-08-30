import { DataTypes } from "sequelize";
import sequelize from "../config/database";

const PasswordResetToken = sequelize.define(
    "PasswordResetToken",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },

        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        tokenHash: {
            type: DataTypes.STRING(64),
            allowNull: false,
            unique: true,
        },

        expiresAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },

        usedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        tableName: "password_reset_tokens",
        timestamps: true,
    }
);

export default PasswordResetToken;