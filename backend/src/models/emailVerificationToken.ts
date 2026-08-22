import { DataTypes } from "sequelize";
import sequelize from "../config/database";

const EmailVerificationToken = sequelize.define(
    "EmailVerificationToken",
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
    },
    {
        tableName: "email_verification_tokens",
        timestamps: true,
    }
);

export default EmailVerificationToken;