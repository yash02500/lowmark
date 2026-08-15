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

  lastCheckedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },

  nextCheckAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },

  checkIntervalMinutes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 60,
  },

  priority: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },

  trackingState: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "active",
  },
},
  {
    tableName: "products",
  }
);

export default Product;