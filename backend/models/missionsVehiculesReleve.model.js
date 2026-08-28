import { DataTypes } from "sequelize";
import sequelize from "../config/db.config.js";

const MissionsVehiculesReleve = sequelize.define(
  "missions_vehicules_releves",
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
      unique: true,
      references: {
        model: "missions_vehicules",
        key: "id",
      },
    },
    modeReleve: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [["kilometre", "horametre"]],
      },
    },
    valeurDepart: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0,
      },
    },
    valeurArrivee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0,
      },
    },
    dateDepart: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    dateArrivee: {
      type: DataTypes.DATE,
      allowNull: true,
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
    tableName: "missions_vehicules_releves",
    timestamps: true,
  },
);

export default MissionsVehiculesReleve;
