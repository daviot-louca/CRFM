"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("missions_vehicules_pleins", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      missionVehiculeId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "missions_vehicules",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      litres: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: false,
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
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

    await queryInterface.addIndex("missions_vehicules_pleins", [
      "missionVehiculeId",
    ]);

    await queryInterface.sequelize.query(`
      ALTER TABLE "missions_vehicules_pleins"
      ADD CONSTRAINT "missions_vehicules_pleins_litres_check"
      CHECK ("litres" > 0)
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("missions_vehicules_pleins");
  },
};
