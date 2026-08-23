"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const types = [
      {
        EMAT8: "Z102UE01",
        typeName: "MERCEDES SPRINTER 319 CHASSIS CAB 43 3.5",
        categorie: "Poids lourds",
      },
      {
        EMAT8: "Z104DE01",
        typeName: "VLTP SAN NP AMBULANCE TYPE A1 FORD RANGE",
        categorie: "Véhicule léger",
      },
      {
        EMAT8: "Z1098Y01",
        typeName: "TRACTEUR NIVELEUR CATERPILLAR D4 AVEC SC",
        categorie: "Poids lourds",
      },
      {
        EMAT8: "40208",
        typeName: "REMORQUE 3 ESSIEUX CENTRAUX PLATEAU FIXE",
        categorie: "Poids lourds",
      },
      {
        EMAT8: "62501",
        typeName: "COMPACTEUR VIBRANT MONOBILLE ASC70HX AMM",
        categorie: "Poids lourds",
      },
      {
        EMAT8: "65006",
        typeName: "TRACTEUR AGRICOLE VALTRA T175 DIRECT (EC",
        categorie: "Poids lourds",
      },
      {
        EMAT8: "65007",
        typeName: "TRACTEUR AGRICOLE VALTRA A95 HITECH",
        categorie: "Poids lourds",
      },
      {
        EMAT8: "66401",
        typeName: "CAMION IVECO PORTEUR POLYVALENT LOGISTIQ",
        categorie: "Poids lourds",
      },
      {
        EMAT8: "66501",
        typeName: "VEHICULE BLINDE DE COMBAT D'INFANTERIE R",
        categorie: "Blindé",
      },
      {
        EMAT8: "80301",
        typeName: "REMORQUE DE TRANSPORT POUR GROUPES ELECT",
        categorie: "Poids lourds",
      },
      {
        EMAT8: "82601",
        typeName: "VGC TT PICK-UP DOUBLE CAB BLOC DIFF GRAN",
        categorie: "Véhicule léger",
      },
      {
        EMAT8: "91401",
        typeName: "TRACTEUR NIVELEUR MOYEN CATERPILLAR D6NX",
        categorie: "Poids lourds",
      },
      {
        EMAT8: "113401",
        typeName: "GROUPE ELECTROGENE FAUCHE 5 KW BASIC 300",
        categorie: "Poids lourds",
      },
      {
        EMAT8: "124803",
        typeName: "VEHICULE LEGER TOUT TERRAIN 4X4 TECHNAMM",
        categorie: "Véhicule léger",
      },
      {
        EMAT8: "126702",
        typeName: "PELLETEUSE CHARGEUSE SUR PNEUS CATERPILL",
        categorie: "Poids lourds",
      },
      {
        EMAT8: "128601",
        typeName: "VEHICULE SANITAIRE 4X4 MERCEDES SPRINTER",
        categorie: "Véhicule léger",
      },
      {
        EMAT8: "169901",
        typeName: "VEHICULE LEGER TACTIQUE POLYVALENT NON P",
        categorie: "Véhicule léger",
      },
      {
        EMAT8: "260801",
        typeName: "VAN 4T5 MASTER TRANSPORT DE 2 CHEVAUX",
        categorie: "Poids lourds",
      },
      {
        EMAT8: "276201",
        typeName: "REMORQUE 3 TONNES DE TRANSPORT POUR GROU",
        categorie: "Poids lourds",
      },
      {
        EMAT8: "318202",
        typeName: "PVP CDT X-CONTACT MK2 RENFORCE KSA",
        categorie: "Blindé",
      },
      {
        EMAT8: "318302",
        typeName: "PVP RANG MK2 RENFORCE NCT-T",
        categorie: "Blindé",
      },
      {
        EMAT8: "330202",
        typeName: "REMORQUE CITERNE A CARBURANT 900 LITRES",
        categorie: "Poids lourds",
      },
      {
        EMAT8: "338101",
        typeName: "TRACTEUR CHARGEUR MOYEN SUR PNEUMATIQUES",
        categorie: "Poids lourds",
      },
      {
        EMAT8: "340401",
        typeName: "PELLE HYDRAULIQUE MOYENNE SUR PNEUMATIQU",
        categorie: "Poids lourds",
      },
      {
        EMAT8: "368201",
        typeName: "VAB ELEMENT LEGER D'INTERVENTION VALORIS",
        categorie: "Blindé",
      },
      {
        EMAT8: "22010101",
        typeName: "VEHICULE LIAISON RENAULT CLIO",
        categorie: "Véhicule léger",
      },
      {
        EMAT8: "22050906",
        typeName: "MERCEDES SPRINTER SC BVA 4X4 BENNE SIGNA",
        categorie: "Poids lourds",
      },
      {
        EMAT8: "22113101",
        typeName: "VEHICULE LEGER TOUT TERRAIN COMMANDEMENT",
        categorie: "Véhicule léger",
      },
      {
        EMAT8: "22233101",
        typeName: "VEHICULE TOUT CHEMIN P4",
        categorie: "Véhicule léger",
      },
      {
        EMAT8: "23010104",
        typeName: "MINIBUS 9 PLACES RENAULT MASTER",
        categorie: "Véhicule léger",
      },
      {
        EMAT8: "24230401",
        typeName: "VEHICULE UTILITAIRE TOUT CHEMIN TRM2000",
        categorie: "Poids lourds",
      },
      {
        EMAT8: "24432201",
        typeName: "GBC 180 CHASSIS LONG A CABINE TOLEE CAIS",
        categorie: "Poids lourds",
      },
      {
        EMAT8: "24462301",
        typeName: "VEHICULE UTILITAIRE TOUT CHEMIN TRM10000",
        categorie: "Poids lourds",
      },
      {
        EMAT8: "24511732",
        typeName: "CAMION MAN 6X4 TGS BENNE ENTREPRENEUR",
        categorie: "Poids lourds",
      },
      {
        EMAT8: "251112A9",
        typeName: "IVECO EUROCARGO 130E18 PLATEAU RIDELLES",
        categorie: "Poids lourds",
      },
      {
        EMAT8: "26331102",
        typeName: "VEHICULE DE MAINTENANCE ET DEPANNAGE TRM",
        categorie: "Poids lourds",
      },
      {
        EMAT8: "26331301",
        typeName: "VEHICULE PORTEUR POLYVALENT LOURD DE DEP",
        categorie: "Poids lourds",
      },
      {
        EMAT8: "27503001",
        typeName: "VEHICULE UTILITAIRE GAMME COMMERCIALE TO",
        categorie: "Véhicule léger",
      },
      {
        EMAT8: "28919001",
        typeName: "AMX30 VERSION DEPANNAGE APTE MITRAILLEUS",
        categorie: "Blindé",
      },
      {
        EMAT8: "29112001",
        typeName: "REMORQUE UTILITAIRE 1/4 TONNE AMERICAINE",
        categorie: "Véhicule léger",
      },
      {
        EMAT8: "29122401",
        typeName: "REMORQUE UTILITAIRE 1 TONNE A FREINAGE P",
        categorie: "Véhicule léger",
      },
      {
        EMAT8: "29141101",
        typeName: "REMORQUE LOGISTIQUE DU PPLOG ET DU PPAV",
        categorie: "Poids lourds",
      },
      {
        EMAT8: "29551301",
        typeName: "REMORQUE SPECIALISEE VAN 2 PLACES",
        categorie: "Poids lourds",
      },
      {
        EMAT8: "29989701",
        typeName: "REMORQUE PORTE VOITURE AUTOMOBILE A BASC",
        categorie: "Poids lourds",
      },
      {
        EMAT8: "30301101",
        typeName: "GROUPE ELECTROGENE 1500W 28V/50A COURANT",
        categorie: "Poids lourds",
      },
      {
        EMAT8: "39901005",
        typeName: "VEHICULE GAMME COMMERCIALE TOUT TERRAIN",
        categorie: "Véhicule léger",
      },
      {
        EMAT8: "39901401",
        typeName: "CAMION CITERNE POUR FEUX DE FORÊT MOYENS",
        categorie: "Poids lourds",
      },
      {
        EMAT8: "39901402",
        typeName: "VEHICULE INCENDIE TOUT TERRAIN SIDES EUR",
        categorie: "Poids lourds",
      },
      {
        EMAT8: "52720502",
        typeName: "DEBROUSSAILLEUR FORESTIER SUR CHENILLES",
        categorie: "Poids lourds",
      },
      {
        EMAT8: "53840101",
        typeName: "CAMION MERCEDES UNIMOG 4X4 CHASSIS COURT",
        categorie: "Poids lourds",
      },
      {
        EMAT8: "5839210S",
        typeName: "CHARIOT ELEVATEUR A BRAS TELESCOPIQUE MA",
        categorie: "Poids lourds",
      },
      {
        EMAT8: "98111701",
        typeName: "CAMION CITERNE POLYVALENT 10M3 RAVITAILL",
        categorie: "Poids lourds",
      },
    ];

    const now = new Date();

    await queryInterface.bulkInsert(
      "vehicules_types",
      types.map((type) => ({
        id: Sequelize.literal("gen_random_uuid()"),
        EMAT8: type.EMAT8,
        typeName: type.typeName,
        categorie: type.categorie,
        UrlImage: `/images/vehicules-types/${type.EMAT8}.webp`,
        createdAt: now,
        updatedAt: now,
      })),
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("vehicules_types", {
      EMAT8: [
        "Z102UE01",
        "Z104DE01",
        "Z1098Y01",
        "40208",
        "62501",
        "65006",
        "65007",
        "66401",
        "66501",
        "80301",
        "82601",
        "91401",
        "113401",
        "124803",
        "126702",
        "128601",
        "169901",
        "260801",
        "276201",
        "318202",
        "318302",
        "330202",
        "338101",
        "340401",
        "368201",
        "22010101",
        "22050906",
        "22113101",
        "22233101",
        "23010104",
        "24230401",
        "24432201",
        "24462301",
        "24511732",
        "251112A9",
        "26331102",
        "26331301",
        "27503001",
        "28919001",
        "29112001",
        "29122401",
        "29141101",
        "29551301",
        "29989701",
        "30301101",
        "39901005",
        "39901401",
        "39901402",
        "52720502",
        "53840101",
        "5839210S",
        "98111701",
      ],
    });
  },
};
