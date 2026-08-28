import { DataTypes } from "sequelize";
import sequelize from "../config/db.config.js";

const MissionsVehiculesPlein = sequelize.define(
  "missions_vehicules_pleins",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    missionVehiculeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "missions_vehicules",
        key: "id",
      },
    },
    litres: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false,
      validate: {
        min: 0.01,
      },
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
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
    tableName: "missions_vehicules_pleins",
    timestamps: true,
  },
);

export default MissionsVehiculesPlein;
