"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("mission_oal", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },

      missionId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "missions",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      oalId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addIndex(
      "mission_oal",
      ["missionId"],
    );

    await queryInterface.addIndex(
      "mission_oal",
      ["oalId"],
    );

    await queryInterface.addIndex(
      "mission_oal",
      ["missionId", "oalId"],
      {
        unique: true,
        name: "missions_oal_mission_id_oal_id_unique",
      },
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable("mission_oal");
  },
};