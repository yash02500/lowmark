import { DataTypes } from "sequelize";
import sequelize from "../config/database";

const UserProduct = sequelize.define("UserProduct", {
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

    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    targetPrice: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
    },

    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
},
    {
        tableName: "user_products",
    }
);

export default UserProduct;