import { DataTypes } from "sequelize";
import sequelize from "../config/db.config.js";

const MissionsEquipages = sequelize.define(
  "MissionsEquipages",
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
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    fonction: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "missions_equipages",
    timestamps: true,
  }
);

export default MissionsEquipages;