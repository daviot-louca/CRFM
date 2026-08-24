import XLSX from "xlsx";
import sequelize from "../config/db.config.js";

import User from "../models/user.model.js";
import Compagnie from "../models/compagnie.model.js";
import Section from "../models/sections.model.js";
import Role from "../models/roles.model.js";

const EXCEL_PATH = "./data/personnels.xlsx";

const TEMP_PASSWORD = "ChangeMe123!";

// Grades → militaires du rang → conducteur
const gradesMilitairesDuRang = ["SDT", "1CL", "CPL", "CCH", "CC1"];

// Grades → sous-officiers → SOA
const gradesSousOfficiers = ["SGT", "SCH", "ADJ", "ADC", "MAJ"];

// Grades → officiers → OA
const gradesOfficiers = ["SLT", "LTN", "CNE", "CDT", "LCL", "COL"];

// Détermine le rôle à partir du grade
function getRoleFromGrade(grade) {
  const gradeNormalise = String(grade).trim().toUpperCase();

  if (gradesMilitairesDuRang.includes(gradeNormalise)) {
    return "conducteur";
  }

  if (gradesSousOfficiers.includes(gradeNormalise)) {
    return "SOA";
  }

  if (gradesOfficiers.includes(gradeNormalise)) {
    return "OA";
  }

  return null;
}

// Récupère l'ID réel du rôle dans PostgreSQL
async function getRoleId(roleName) {
  const role = await Role.findOne({
    where: {
      roleName: roleName,
    },
  });

  if (!role) {
    throw new Error(`Rôle introuvable en base : "${roleName}"`);
  }

  return role.id;
}

async function importPersonnels() {
  try {
    console.log("Connexion à la base de données...");

    await sequelize.authenticate();

    console.log("Connexion réussie.");

    // 1. Lecture du fichier Excel
    const workbook = XLSX.readFile(EXCEL_PATH);

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: "",
    });

    console.log(`${rows.length} lignes trouvées dans Excel.`);

    let imported = 0;
    let skipped = 0;
    let errors = 0;

    // 2. Traitement de chaque ligne
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      try {
        const compagnieNom = String(row[0] || "").trim();
        const sectionNom = String(row[1] || "").trim();
        const nom = String(row[2] || "").trim();
        const grade = String(row[3] || "").trim();

        if (row.some((value) => String(value).trim() === "#MULTIVALUE")) {
          skipped++;

          continue;
        }
        // Une seule information manque → ligne ignorée
        if (!compagnieNom || !sectionNom || !nom || !grade) {
          console.log(`Ligne ${i + 2} ignorée : données manquantes.`, row);

          skipped++;
          continue;
        }

        // 3. Détermination du rôle selon le grade
        const roleName = getRoleFromGrade(grade);

        if (!roleName) {
          console.log(`Ligne ${i + 2} ignorée : grade inconnu "${grade}".`);

          skipped++;
          continue;
        }

        // 4. Récupération de l'UUID du rôle
        const roleId = await getRoleId(roleName);

        // 5. Recherche de la compagnie
        const compagnie = await Compagnie.findOne({
          where: {
            nom: compagnieNom,
          },
        });

        if (!compagnie) {
          console.log(
            `Ligne ${i + 2} : compagnie introuvable "${compagnieNom}".`,
          );

          errors++;
          continue;
        }

        // 6. Recherche de la section dans cette compagnie
        const section = await Section.findOne({
          where: {
            sectionName: sectionNom,
            compagnieId: compagnie.id,
          },
        });

        if (!section) {
          console.log(
            `Ligne ${i + 2} : section introuvable "${sectionNom}" dans "${compagnieNom}".`,
          );

          errors++;
          continue;
        }

        // 7. Vérification d'un éventuel doublon
        const existingUser = await User.findOne({
          where: {
            lastName: nom,
            grade: grade,
            sectionId: section.id,
          },
        });

        if (existingUser) {
          console.log(`Ligne ${i + 2} : ${grade} ${nom} existe déjà.`);

          skipped++;
          continue;
        }

        // 8. Création du personnel
        await User.create({
          lastName: nom,
          grade: grade,
          sectionId: section.id,
          roleId: roleId,
          password: TEMP_PASSWORD,
        });

        imported++;

        console.log(
          `✓ Importé : ${grade} ${nom} → ${roleName} — ${compagnieNom} — ${sectionNom}`,
        );
      } catch (error) {
        errors++;

        console.error(`Erreur ligne ${i + 2} :`, error.message);
      }
    }

    console.log("\n========== RAPPORT ==========");
    console.log(`Importés : ${imported}`);
    console.log(`Ignorés  : ${skipped}`);
    console.log(`Erreurs  : ${errors}`);
    console.log(`Total    : ${rows.length}`);
    console.log("==============================\n");
  } catch (error) {
    console.error("Erreur globale :", error);
  } finally {
    await sequelize.close();
  }
}

importPersonnels();
