import { DataTypes } from "sequelize";
import sequelize from "../config/db.config.js";

const MissionsUsers = sequelize.define(
  "missions_users",
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
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
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
  },
  {
    tableName: "missions_users",
    timestamps: true,
  },
);

export default MissionsUsers;
