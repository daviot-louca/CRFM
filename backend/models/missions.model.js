import { DataTypes } from "sequelize";
import sequelize from "../config/db.config.js";

const Missions = sequelize.define(
  "missions",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    missionName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    missionDescription: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    debutMission: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    finMission: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    typeMission: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lieuMission: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    StatutMission: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    oaId: {
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
    tableName: "missions",
    timestamps: true,
  },
);

export default Missions;
