import { DataTypes } from "sequelize";
import sequelize from "../config/db.config.js";

const vehicule = sequelize.define(
  "vehicule",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    vehiculeName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    immatriculation: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    kilometrage: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    horametre: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    carburant: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    disponibilite: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    vehiculeTypeId: {
      type: DataTypes.UUID,
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
    tableName: "vehicules",
    timestamps: true,
  },
);

export default vehicule;
