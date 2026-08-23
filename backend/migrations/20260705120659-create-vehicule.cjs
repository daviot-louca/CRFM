"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("vehicules", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      vehiculeName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      immatriculation: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      kilometrage: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      horametre: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      carburant: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      disponibilite: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      vehiculeTypeId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "vehicules_types",
          key: "id",
        },
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
    await queryInterface.dropTable("vehicules");
  },
};
