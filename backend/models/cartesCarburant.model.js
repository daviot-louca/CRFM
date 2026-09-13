import { DataTypes } from "sequelize";
import sequelize from "../config/db.config.js";

const CarteCarburant = sequelize.define(
  "CarteCarburant",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },

    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    numero: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    code: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "cartes_carburant",
  },
);

export default CarteCarburant;