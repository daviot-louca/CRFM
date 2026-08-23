import { DataTypes } from "sequelize";
import sequelize from "../config/db.config.js";

const Compagnie = sequelize.define(
  "compagnies",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    nom: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ordre:{
      type:DataTypes.INTEGER,
      allowNull:false,
    },
    oaId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    tableName: "compagnies",
  },
);

export default Compagnie;
