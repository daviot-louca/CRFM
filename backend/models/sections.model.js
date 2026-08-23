import { DataTypes } from "sequelize";
import sequelize from "../config/db.config.js";

const Section = sequelize.define("sections", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  sectionName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  compagnieId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "compagnies",
      key: "id",
    },
  },
  chefSectionId: {
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
});

export default Section;
