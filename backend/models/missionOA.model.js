import { DataTypes } from "sequelize";
import sequelize from "../config/db.config.js";

const MissionOA = sequelize.define(
  "MissionOA",
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

    oaId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    tableName: "mission_oa",
    timestamps: true,
  },
);

export default MissionOA;