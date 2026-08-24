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
      const nom = compagnieNom.trim();

      if (
        nom === "COMPAGNIE DE COMMANDEMENT ET DE LOGISTIQUE" ||
        nom === "ccl"
      ) {
        return [
          "SECTION CDT REGIMENTAIRE",
          "SECTION CDT DE CCL",
          "BOI",
          "BML",
          "SCAB",
        ];
      }

      if (
        nom === "COMPAGNIE D' ECLAIRAGE ET D' APPUI" ||
        nom === "cea"
      ) {
        return [
          "SECTION DE COMMANDEMENT ET DE LOGISTIQUE",
          "SECTION D'AIDE A L'ENGAGEMENT DEBARQUE",
          "MDA - SECTION ANTI CHAR",
          "MDA - SECTION TELD",
          "SRGE",
          "SECTION APPUI MORTIER 120",
        ];
      }
      if (
        nom === "16E BCP - RESERVES" 
      ) {
        return [
          "UNITES OPERATIONNELLES",
        ];
      }

      return [
        "SECTION DE COMMANDEMENT ET DE LOGISTIQUE",
        "1RE SECTION DE COMBAT",
        "2E SECTION DE COMBAT",
        "3E SECTION DE COMBAT",
        "MDA - SECTION D'APPUI",
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