'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('missions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      missionName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      missionDescription: {
        type: Sequelize.STRING,
        allowNull: false
      },
      debutMission: {
        type: Sequelize.DATE,
        allowNull: false
      },
      finMission: {
        type: Sequelize.DATE,
        allowNull: false
      },
      typeMission:{
        type: Sequelize.STRING,
        allowNull: false
      },
      lieuMission: {
        type: Sequelize.STRING,
        allowNull: false
      },
      StatutMission: {
        type: Sequelize.STRING,
        allowNull: false
      },
      oaId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('missions');
  }
};
