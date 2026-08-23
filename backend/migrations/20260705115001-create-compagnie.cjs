'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('compagnies', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      nom: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      imageUrl:{
        type:Sequelize.STRING,
        allowNull:false
      },
      ordre:{
        type:Sequelize.INTEGER,
        allowNull:false,
      },
      oaId: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('compagnies');
  },
};