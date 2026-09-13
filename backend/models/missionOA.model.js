import { DataTypes } from "sequelize";
import sequelize from "../config/db.config.js";

const MissionOAL = sequelize.define(
  "MissionOAL",
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

    oalId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    tableName: "mission_oal",
    timestamps: true,
  },
);

export default MissionOAL;