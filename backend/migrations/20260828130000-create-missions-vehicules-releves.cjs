"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("missions_vehicules_releves", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      missionVehiculeId: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: "missions_vehicules",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      modeReleve: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      valeurDepart: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      valeurArrivee: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      dateDepart: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      dateArrivee: {
        type: Sequelize.DATE,
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

    await queryInterface.sequelize.query(`
      ALTER TABLE "missions_vehicules_releves"
      ADD CONSTRAINT "missions_vehicules_releves_mode_releve_check"
      CHECK ("modeReleve" IN ('kilometre', 'horametre'))
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "missions_vehicules_releves"
      ADD CONSTRAINT "missions_vehicules_releves_valeurs_check"
      CHECK (
        ("valeurDepart" IS NULL OR "valeurDepart" >= 0)
        AND ("valeurArrivee" IS NULL OR "valeurArrivee" >= 0)
        AND (
          "valeurDepart" IS NULL
          OR "valeurArrivee" IS NULL
          OR "valeurArrivee" >= "valeurDepart"
        )
      )
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("missions_vehicules_releves");
  },
};
