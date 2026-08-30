"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("mission_oa", {
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

      oaId: {
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
      "mission_oa",
      ["missionId"],
    );

    await queryInterface.addIndex(
      "mission_oa",
      ["oaId"],
    );

    await queryInterface.addIndex(
      "mission_oa",
      ["missionId", "oaId"],
      {
        unique: true,
        name: "missions_oa_mission_id_oa_id_unique",
      },
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable("mission_oa");
  },
};