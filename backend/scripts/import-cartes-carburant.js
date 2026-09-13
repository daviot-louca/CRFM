import XLSX from "xlsx";
import sequelize from "../config/db.config.js";
import CarteCarburant from "../models/cartesCarburant.model.js";

const fichierExcel = "./data/cartesCarburantMilitaires.xlsx";

const importerCartesCarburant = async () => {
  try {
    const workbook = XLSX.readFile(fichierExcel);

    const nomFeuille = workbook.SheetNames[0];
    const feuille = workbook.Sheets[nomFeuille];

    const lignes = XLSX.utils.sheet_to_json(feuille, {
      header: 1,
      defval: null,
    });

    // On ignore la première ligne si elle contient les titres
    const donnees = lignes.slice(1);

    const cartes = [];

    for (const ligne of donnees) {
      const type = ligne[0];
      const numero = ligne[1];
      const code = ligne[2];

      // Ignore les lignes vides
      if (!type && !numero && !code) {
        continue;
      }

      // Vérification des données
      if (type === null || numero === null || code === null) {
        console.warn("Ligne ignorée : données incomplètes", ligne);
        continue;
      }

      cartes.push({
        type: String(type).trim(),
        numero: String(numero).trim(),
        code: Number(code),
      });
    }

    if (cartes.length === 0) {
      return;
    }
    await CarteCarburant.bulkCreate(cartes);

  } catch (error) {
    console.error("Erreur pendant l'import :", error);
  } finally {
    await sequelize.close();
  }
};

importerCartesCarburant();