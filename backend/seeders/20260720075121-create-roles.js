'use strict';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('roles', [
      {
        id: Sequelize.literal('gen_random_uuid()'),
        roleName: 'administrateur',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        roleName: 'OA',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        roleName: 'SOA',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        roleName: 'conducteur',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        roleName: 'soldat',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('roles', {
      roleName: {
        [Sequelize.Op.in]: [
          'administrateur',
          'OA',
          'SOA',
          'conducteur',
          'soldat'
        ],
      },
    });
  },
};