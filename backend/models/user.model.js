import bcrypt from "bcrypt";
import { DataTypes } from "sequelize";
import sequelize from "../config/db.config.js";

const SALT_ROUNDS = 12;
const BCRYPT_HASH_REGEX = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

const hashPassword = async (user) => {
  if (user.password && !BCRYPT_HASH_REGEX.test(user.password)) {
    user.password = await bcrypt.hash(user.password, SALT_ROUNDS);
  }
};

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    grade: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "nom",
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sectionId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "section_id",
      references: {
        model: "sections",
        key: "id",
      },
    },
    roleId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "role_id",
      references: {
        model: "roles",
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
    tableName: "users",
    hooks: {
      beforeCreate: hashPassword,
      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          await hashPassword(user);
        }
      },
    },
  },
);

export default User;
