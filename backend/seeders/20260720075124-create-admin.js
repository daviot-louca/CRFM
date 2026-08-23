import bcrypt from "bcrypt";

export async function up(queryInterface) {
  // 1. Récupérer le rôle administrateur
  const [roles] = await queryInterface.sequelize.query(`
    SELECT id
    FROM roles
    WHERE "roleName" = 'administrateur'
    LIMIT 1;
  `);

  if (roles.length === 0) {
    throw new Error(
      "Le rôle administrateur n'existe pas. Exécute d'abord le seeder des rôles."
    );
  }

  const adminRoleId = roles[0].id;

  // 2. Récupérer la section de commandement de la compagnie de l'admin
  const [sections] = await queryInterface.sequelize.query(`
    SELECT id
    FROM sections
    WHERE "sectionName" LIKE 'SCAB%'
    ORDER BY "sectionName"
    LIMIT 1;
  `);

  if (sections.length === 0) {
    throw new Error(
      "Aucune section de commandement trouvée. Exécute d'abord les seeders compagnies et sections."
    );
  }

  const adminSectionId = sections[0].id;

  // 3. Hasher le mot de passe
  const hashedPassword = await bcrypt.hash("0", 10);

  // 4. Créer l'administrateur
  await queryInterface.bulkInsert("users", [
    {
      id: queryInterface.sequelize.literal("gen_random_uuid()"),
      nom: "Admin",

      // Nécessaire car grade est allowNull: false dans ta migration users
      grade: "Administrateur",

      email: "admin@crfm.fr",

      password: hashedPassword,

      // UUID récupérés directement depuis la base
      role_id: adminRoleId,
      section_id: adminSectionId,

      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
}

export async function down(queryInterface) {
  await queryInterface.bulkDelete("users", {
    email: "admin@crfm.fr",
  });
}