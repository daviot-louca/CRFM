import { DataTypes } from "sequelize";
import sequelize from "../config/db.config.js";

const vehiculesTypes = sequelize.define(
  "vehiculesTypes",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    typeName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    EMAT8: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    categorie: {
      type: DataTypes.ENUM("Véhicule léger", "Poids lourds", "Blindé"),
      allowNull: false,
      defaultValue: "Véhicule léger",
    },
    UrlImage: {
      type: DataTypes.STRING,
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
    tableName: "vehicules_types",
  },
);

export default vehiculesTypes;
