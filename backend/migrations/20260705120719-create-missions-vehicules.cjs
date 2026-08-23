'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('missions_vehicules', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      missionId: {
        type: Sequelize.UUID,
        references: {
          model: 'missions',
          key: 'id'
        },
        allowNull: false
      },
      vehiculeId: {
        type: Sequelize.UUID,
        references: {
          model: 'vehicules',
          key: 'id'
        },
        allowNull: false
      },
      compagnieId: {
        type: Sequelize.UUID,
        references: {
          model: 'compagnies',
          key: 'id'
        },
        allowNull: false
      },
      sectionId: {
        type: Sequelize.UUID,
        references: {
          model: 'sections',
          key: 'id'
        },
        allowNull: true
      },
      missionGroupeId: {
        type: Sequelize.UUID,
        references: {
          model: 'missions_groupes',
          key: 'id'
        },
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('missions_vehicules');
  }
};