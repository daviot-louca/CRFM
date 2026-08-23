"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("vehicules_types", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      EMAT8: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      typeName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      categorie: {
        type: Sequelize.ENUM("Véhicule léger", "Poids lourds", "Blindé"),
        allowNull: false,
        defaultValue: "Véhicule léger",
      },
      UrlImage: {
        type: Sequelize.STRING,
        allowNull: true,
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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("vehicules_types");
  },
};
