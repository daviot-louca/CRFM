'use strict';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('compagnies', [
      {
        id: Sequelize.literal('gen_random_uuid()'),
        nom: "CEA: Compagnie d'Éclairage et d'Appui",
        imageUrl:"/images/logoCompagnie/CEA.webp",
        ordre:8,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        nom: "1ère Compagnie de Combat",
        imageUrl:"/images/logoCompagnie/1ereCompagnie.webp",
        ordre:1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        nom: "2ème Compagnie de Combat",
        imageUrl:"/images/logoCompagnie/2emeCompagnie.webp",
        ordre:2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        nom: "3ème Compagnie de Combat",
        imageUrl:"/images/logoCompagnie/3emeCompagnie.webp",
        ordre:3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        nom: "4ème Compagnie de Combat",
        imageUrl:"/images/logoCompagnie/4emeCompagnie.webp",
        ordre:4,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        nom: "Compagnie de Commandement et de Logistique",
        imageUrl:"/images/logoCompagnie/CCL.webp",
        ordre:7,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        nom: "Ecoles Des Braves",
        imageUrl:"/images/logoCompagnie/EDB.webp",
        ordre:5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        nom: "6ème Compagnie de Combat",
        imageUrl:"/images/logoCompagnie/6emeCompagnie.webp",
        ordre:6,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('compagnies', {
      nom: [
        "CEA: Compagnie d'Éclairage et d'Appui",
        "1ère Compagnie de Combat",
        "2ème Compagnie de Combat",
        "3ème Compagnie de Combat",
        "4ème Compagnie de Combat",
        "Compagnie de Commandement et de Logistique",
        "Ecoles Des Braves",
        "6ème Compagnie de Combat",
      ],
    });
  },
};