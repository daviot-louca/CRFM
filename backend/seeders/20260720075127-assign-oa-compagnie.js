"use strict";

export default {
  async up(queryInterface) {
    // Récupérer l'OA et la compagnie correspondant à sa section
    const [results] = await queryInterface.sequelize.query(`
      SELECT 
        u.id AS "oaId",
        s."compagnieId"
      FROM users u
      JOIN sections s ON s.id = u.section_id
      WHERE u.email = 'oa@crfm.fr'
      LIMIT 1;
    `);

    if (results.length === 0) {
      throw new Error(
        "OA introuvable ou aucune compagnie associée à sa section."
      );
    }

    const { oaId, compagnieId } = results[0];

    // Affecter l'OA à la compagnie
    await queryInterface.sequelize.query(
      `
        UPDATE compagnies
        SET "oaId" = :oaId,
            "updatedAt" = CURRENT_TIMESTAMP
        WHERE id = :compagnieId;
      `,
      {
        replacements: {
          oaId,
          compagnieId,
        },
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      UPDATE compagnies
      SET "oaId" = NULL,
          "updatedAt" = CURRENT_TIMESTAMP
      WHERE "oaId" = (
        SELECT id
        FROM users
        WHERE email = 'oa@crfm.fr'
        LIMIT 1
      );
    `);
  },
};