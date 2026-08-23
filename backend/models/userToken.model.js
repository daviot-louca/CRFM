import { DataTypes } from "sequelize";
import sequelize from "../config/db.config.js";

const UserToken = sequelize.define(
  "user_tokens",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "user_tokens",
    timestamps: true,
  },
);

export default UserToken;
