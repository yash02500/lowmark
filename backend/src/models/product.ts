import { DataTypes } from "sequelize";
import sequelize from "../config/database";

const Product = sequelize.define("Product", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },

    url: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    currentPrice: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },

    platform: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: "INR",
    },
  },
  {
    tableName: "products",
  }
);

export default Product;