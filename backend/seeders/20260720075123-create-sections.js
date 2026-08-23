"use strict";

export default {
  async up(queryInterface, Sequelize) {
    // Récupère toutes les compagnies déjà créées
    const [compagnies] = await queryInterface.sequelize.query(`
      SELECT id, nom
      FROM compagnies
      ORDER BY nom;
    `);

    if (compagnies.length === 0) {
      throw new Error(
        "Aucune compagnie trouvée. Exécute d'abord le seeder des compagnies."
      );
    }

    // Définit les sections selon le type de compagnie
    const getSectionNames = (compagnieNom) => {
      const nom = compagnieNom.trim().toLowerCase();

      if (
        nom === "compagnie de commandement et de logistique" ||
        nom === "ccl"
      ) {
        return [
          "Section CDT REGIMENTAIRE",
          "Section CDT de CCL",
          "BOI",
          "BML",
          "SCAB",
        ];
      }

      if (
        nom === "cea: compagnie d'éclairage et d'appui" ||
        nom === "cea"
      ) {
        return [
          "Section commandement et de logistique",
          "Section d'aide à l'engagement débarqué",
          "Section anti-char",
          "Section TELD",
          "SRGE",
          "Section appui mortier 120",
        ];
      }

      return [
        "Section de commandement et de logistique",
        "1ère section",
        "2ème section",
        "3ème section",
        "MDA",
        "Section appui",
      ];
    };

    const sections = compagnies.flatMap((compagnie) =>
      getSectionNames(compagnie.nom).map((sectionName) => ({
        id: Sequelize.literal("gen_random_uuid()"),
        sectionName,
        chefSectionId: null,
        compagnieId: compagnie.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    );

    await queryInterface.bulkInsert("sections", sections);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("sections", null, {});
  },
};