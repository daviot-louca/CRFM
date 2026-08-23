'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface) {
    const [results] = await queryInterface.sequelize.query(`
      SELECT
        u.id AS "soaId",
        u.section_id AS "sectionId"
      FROM users u
      WHERE u.email = 'soa@crfm.fr'
      LIMIT 1;
    `);

    if (results.length === 0) {
      throw new Error("SOA introuvable.");
    }

    const { soaId, sectionId } = results[0];

    await queryInterface.sequelize.query(
      `
        UPDATE sections
        SET "chefSectionId" = :soaId,
            "updatedAt" = CURRENT_TIMESTAMP
        WHERE id = :sectionId;
      `,
      {
        replacements: {
          soaId,
          sectionId,
        },
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      UPDATE sections
      SET "chefSectionId" = NULL,
          "updatedAt" = CURRENT_TIMESTAMP
      WHERE "chefSectionId" = (
        SELECT id
        FROM users
        WHERE email = 'soa@crfm.fr'
        LIMIT 1
      );
    `);
  },
};
