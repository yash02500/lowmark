import { DataTypes } from "sequelize";
import sequelize from "../config/database";

const RefreshToken = sequelize.define("refresh_token", {
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

  token: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },

  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

export default RefreshToken;