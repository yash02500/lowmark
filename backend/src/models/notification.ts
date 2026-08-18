import { DataTypes } from "sequelize";
import sequelize from "../config/database";

const Notification = sequelize.define("Notification", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },

    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    type: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    message: {
        type: DataTypes.TEXT,
        allowNull: false,
    },

    isRead: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
},
    {
        tableName: "notifications",
        timestamps: true,
    }
);

export default Notification;