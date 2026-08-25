import { DataTypes } from "sequelize";
import sequelize from "../config/db.config.js";

const MissionsVehicule = sequelize.define(
  "missions_vehicules",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    missionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "missions",
        key: "id",
      },
    },
    vehiculeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "vehicules",
        key: "id",
      },
    },
    compagnieId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "compagnies",
        key: "id",
      },
    },
    sectionId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "sections",
        key: "id",
      },
    },
    missionGroupeId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "missions_groupes",
        key: "id",
      },
    },
    conducteurId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
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
    tableName: "missions_vehicules",
    timestamps: true,
  },
);

export default MissionsVehicule;
