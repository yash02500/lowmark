import { DataTypes } from "sequelize";
import sequelize from "../config/database";

const PushSubscription = sequelize.define(
    "PushSubscription",
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

        endpoint: {
            type: DataTypes.TEXT,
            allowNull: false,
            unique: true,
        },

        p256dh: {
            type: DataTypes.TEXT,
            allowNull: false,
        },

        auth: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    },
    {
        tableName: "push_subscriptions",
        timestamps: true,
    }
);

export default PushSubscription;