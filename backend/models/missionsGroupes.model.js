

import { DataTypes } from "sequelize";
import sequelize from "../config/db.config.js";

const MissionsGroupes = sequelize.define(
    "missionsGroupes",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        missionId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "missions",
                key: "id",
            },
        },
        nom: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        ordre: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        soaId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "users",
                key: "id",
            },
        },
    },
    {
        tableName: "missions_groupes",
        timestamps: true,
    }
);

export default MissionsGroupes;