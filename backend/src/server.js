import dotenv from "dotenv";
dotenv.config();

import app from "../src/app.js";
import sequelize from "../config/db.config.js";

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await sequelize.authenticate();

    console.log("✅ PostgreSQL connecté");

    app.listen(PORT, () => {
      console.log(`🚀 Serveur lancé sur le port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Impossible de démarrer le serveur");
    console.error(error);
    process.exit(1);
  }
}

startServer();