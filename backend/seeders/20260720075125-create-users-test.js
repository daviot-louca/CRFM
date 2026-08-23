"use strict";

import bcrypt from "bcrypt"

export default {
  async up(queryInterface, Sequelize) {
    // 1. Récupérer les rôles
    const [roles] = await queryInterface.sequelize.query(`
      SELECT id, "roleName"
      FROM roles;
    `);

    const getRoleId = (roleName) => {
      const role = roles.find((r) => r.roleName === roleName);

      if (!role) {
        throw new Error(`Rôle introuvable : ${roleName}`);
      }

      return role.id;
    };

    // 2. Récupérer les sections disponibles
    const [sections] = await queryInterface.sequelize.query(`
      SELECT id, "sectionName", "compagnieId"
      FROM sections
      ORDER BY "sectionName";
    `);

    if (sections.length === 0) {
      throw new Error(
        "Aucune section trouvée. Exécute d'abord les seeders compagnies et sections."
      );
    }

    // Pour les tests, on utilise une section existante.
    const sectionTest = sections[0];

    // 3. Hasher le mot de passe de test
    const password = await bcrypt.hash("Test123!", 10);

    // 4. Créer les utilisateurs
    await queryInterface.bulkInsert("users", [
      {
        id: Sequelize.literal("gen_random_uuid()"),
        grade: "Capitaine",
        nom: "Test",
        email: "oa@crfm.fr",
        password,
        section_id: sectionTest.id,
        role_id: getRoleId("OA"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: Sequelize.literal("gen_random_uuid()"),
        grade: "Adjudant",
        nom: "Test",
        email: "soa@crfm.fr",
        password,
        section_id: sectionTest.id,
        role_id: getRoleId("SOA"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: Sequelize.literal("gen_random_uuid()"),
        grade: "Caporal",
        nom: "Test",
        email: "conducteur@crfm.fr",
        password,
        section_id: sectionTest.id,
        role_id: getRoleId("conducteur"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("users", {
      email: [
        "oa@crfm.fr",
        "soa@crfm.fr",
        "conducteur@crfm.fr",
      ],
    });
  },
};