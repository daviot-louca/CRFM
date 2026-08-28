import {
  Compagnie,
  Mission,
  MissionsGroupes,
  MissionsVehicule,
  MissionsVehiculesPlein,
  MissionsVehiculesReleve,
  Section,
  Vehicule,
  VehiculeType,
} from "../models/index.js";

const releveModes = ["kilometre", "horametre"];

const conducteurVehiculeIncludes = [
  {
    model: Mission,
    as: "mission",
  },
  {
    model: Vehicule,
    as: "vehicule",
    include: [
      {
        model: VehiculeType,
        as: "vehiculeType",
      },
    ],
  },
  {
    model: Compagnie,
    as: "compagnie",
  },
  {
    model: Section,
    as: "section",
  },
  {
    model: MissionsGroupes,
    as: "groupe",
  },
  {
    model: MissionsVehiculesReleve,
    as: "releve",
  },
];

const conducteurVehiculeDetailIncludes = [
  ...conducteurVehiculeIncludes,
  {
    model: MissionsVehiculesPlein,
    as: "pleins",
  },
];

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const assertAuthenticatedUser = (userId) => {
  if (!userId) {
    throw createError("Utilisateur non authentifié.", 401);
  }
};

const toPlain = (record) => (record?.toJSON ? record.toJSON() : record);

const toNumberOrNull = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const hasField = (payload, field) =>
  Object.prototype.hasOwnProperty.call(payload, field);

const parseOptionalNumber = (payload, field, label) => {
  if (!hasField(payload, field)) {
    return undefined;
  }

  const value = payload[field];

  if (value === null || value === "") {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    throw createError(`${label} doit être numérique.`, 400);
  }

  if (parsed < 0) {
    throw createError(`${label} ne peut pas être négatif.`, 400);
  }

  return parsed;
};

const parsePositiveNumber = (value, label) => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    throw createError(`${label} doit être numérique.`, 400);
  }

  if (parsed <= 0) {
    throw createError(`${label} doit être strictement supérieur à 0.`, 400);
  }

  return parsed;
};

const parseDate = (value) => {
  if (value === null || value === undefined || value === "") {
    return new Date();
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw createError("La date du plein est invalide.", 400);
  }

  return date;
};

const normalizeModeReleve = (value) => {
  if (!value) {
    throw createError("Le mode de relevé est obligatoire.", 400);
  }

  if (!releveModes.includes(value)) {
    throw createError("Le mode de relevé doit être kilometre ou horametre.", 400);
  }

  return value;
};

const getStatutReleve = (releve) => {
  if (!releve?.modeReleve || toNumberOrNull(releve?.valeurDepart) === null) {
    return "À compléter";
  }

  if (toNumberOrNull(releve?.valeurArrivee) === null) {
    return "Départ renseigné";
  }

  return "Terminé";
};

const getVehiculeName = (vehicule) =>
  vehicule?.vehiculeName ?? vehicule?.nom ?? "Véhicule inconnu";

const getVehiculeTypeName = (vehicule) =>
  vehicule?.vehiculeType?.typeName ??
  vehicule?.vehiculeType?.nom ??
  vehicule?.type ??
  "Type non renseigné";

const serializeMission = (mission) => {
  if (!mission) return null;

  return {
    id: mission.id,
    nom: mission.missionName,
    missionName: mission.missionName,
    description: mission.missionDescription,
    debutMission: mission.debutMission,
    finMission: mission.finMission,
    typeMission: mission.typeMission,
    lieuMission: mission.lieuMission,
    statut: mission.StatutMission,
    StatutMission: mission.StatutMission,
  };
};

const serializeVehicule = (vehicule) => {
  if (!vehicule) return null;

  return {
    id: vehicule.id,
    nom: getVehiculeName(vehicule),
    vehiculeName: vehicule.vehiculeName,
    type: getVehiculeTypeName(vehicule),
    immatriculation: vehicule.immatriculation,
    kilometrage: vehicule.kilometrage,
    horametre: vehicule.horametre,
    carburant: vehicule.carburant,
    vehiculeType: vehicule.vehiculeType
      ? {
          id: vehicule.vehiculeType.id,
          typeName: vehicule.vehiculeType.typeName,
          EMAT8: vehicule.vehiculeType.EMAT8,
          categorie: vehicule.vehiculeType.categorie,
          UrlImage: vehicule.vehiculeType.UrlImage,
        }
      : null,
  };
};

const serializeReleve = (releve) => {
  if (!releve) {
    return null;
  }

  return {
    id: releve.id,
    missionVehiculeId: releve.missionVehiculeId,
    modeReleve: releve.modeReleve,
    valeurDepart: toNumberOrNull(releve.valeurDepart),
    valeurArrivee: toNumberOrNull(releve.valeurArrivee),
    dateDepart: releve.dateDepart,
    dateArrivee: releve.dateArrivee,
    statut: getStatutReleve(releve),
  };
};

const serializePlein = (plein) => {
  if (!plein) return null;

  return {
    id: plein.id,
    missionVehiculeId: plein.missionVehiculeId,
    litres: toNumberOrNull(plein.litres),
    date: plein.date,
  };
};

const serializeMissionVehicule = (missionVehicule) => {
  const data = toPlain(missionVehicule);
  const vehicule = serializeVehicule(data.vehicule);
  const releve = serializeReleve(data.releve);
  const pleins = Array.isArray(data.pleins)
    ? data.pleins.map(serializePlein).filter(Boolean)
    : [];

  return {
    id: data.id,
    missionVehiculeId: data.id,
    missionId: data.missionId,
    vehiculeId: data.vehiculeId,
    conducteurId: data.conducteurId,
    nom: vehicule?.nom ?? "Véhicule inconnu",
    type: vehicule?.type ?? "Type non renseigné",
    immatriculation: vehicule?.immatriculation ?? "Non renseignée",
    vehicule,
    groupe: data.groupe
      ? {
          id: data.groupe.id,
          nom: data.groupe.nom,
          ordre: data.groupe.ordre,
        }
      : null,
    compagnie: data.compagnie
      ? {
          id: data.compagnie.id,
          nom: data.compagnie.nom,
        }
      : null,
    section: data.section
      ? {
          id: data.section.id,
          nom: data.section.sectionName,
          sectionName: data.section.sectionName,
        }
      : null,
    mission: serializeMission(data.mission),
    releve,
    pleins,
    statutReleve: getStatutReleve(releve),
  };
};

const getMissionVehiculeForConducteur = async (
  missionVehiculeId,
  userId,
  include = conducteurVehiculeIncludes,
) => {
  assertAuthenticatedUser(userId);

  const missionVehicule = await MissionsVehicule.findOne({
    where: {
      id: missionVehiculeId,
      conducteurId: userId,
    },
    include,
  });

  if (!missionVehicule) {
    throw createError("Véhicule affecté introuvable pour ce conducteur.", 404);
  }

  return missionVehicule;
};

const attachAssociation = (record, alias, value) => {
  if (typeof record?.setDataValue === "function") {
    record.setDataValue(alias, value);
    return;
  }

  record[alias] = value;
};

export const getConducteurVehiculesService = async (userId) => {
  assertAuthenticatedUser(userId);

  const missionsVehicules = await MissionsVehicule.findAll({
    where: {
      conducteurId: userId,
    },
    include: conducteurVehiculeIncludes,
    order: [
      [{ model: Mission, as: "mission" }, "debutMission", "DESC"],
      ["createdAt", "DESC"],
    ],
  });

  return missionsVehicules.map(serializeMissionVehicule);
};

export const getConducteurVehiculeDetailService = async (
  missionVehiculeId,
  userId,
) => {
  const missionVehicule = await getMissionVehiculeForConducteur(
    missionVehiculeId,
    userId,
    conducteurVehiculeDetailIncludes,
  );

  return serializeMissionVehicule(missionVehicule);
};

export const saveConducteurReleveService = async (
  missionVehiculeId,
  userId,
  payload,
) => {
  if (!payload || Object.keys(payload).length === 0) {
    throw createError("Aucune donnée de relevé à enregistrer.", 400);
  }

  const missionVehicule = await getMissionVehiculeForConducteur(
    missionVehiculeId,
    userId,
    conducteurVehiculeDetailIncludes,
  );

  const releve = await MissionsVehiculesReleve.findOne({
    where: {
      missionVehiculeId,
    },
  });

  const modeReleve = normalizeModeReleve(
    hasField(payload, "modeReleve") ? payload.modeReleve : releve?.modeReleve,
  );
  const valeurDepartInput = parseOptionalNumber(
    payload,
    "valeurDepart",
    "La valeur de départ",
  );
  const valeurArriveeInput = parseOptionalNumber(
    payload,
    "valeurArrivee",
    "La valeur d'arrivée",
  );
  const valeurDepart =
    valeurDepartInput !== undefined
      ? valeurDepartInput
      : toNumberOrNull(releve?.valeurDepart);
  const valeurArrivee =
    valeurArriveeInput !== undefined
      ? valeurArriveeInput
      : toNumberOrNull(releve?.valeurArrivee);

  if (
    valeurDepart !== null &&
    valeurArrivee !== null &&
    valeurArrivee < valeurDepart
  ) {
    throw createError(
      "La valeur d'arrivée ne peut pas être inférieure à la valeur de départ.",
      400,
    );
  }

  const now = new Date();
  const releveData = {
    missionVehiculeId,
    modeReleve,
    valeurDepart,
    valeurArrivee,
    dateDepart:
      valeurDepart === null ? null : releve?.dateDepart ?? now,
    dateArrivee:
      valeurArrivee === null ? null : releve?.dateArrivee ?? now,
  };

  const savedReleve = releve
    ? await releve.update(releveData)
    : await MissionsVehiculesReleve.create(releveData);

  attachAssociation(missionVehicule, "releve", savedReleve);

  return serializeMissionVehicule(missionVehicule);
};

export const getConducteurPleinsService = async (
  missionVehiculeId,
  userId,
) => {
  await getMissionVehiculeForConducteur(missionVehiculeId, userId, []);

  const pleins = await MissionsVehiculesPlein.findAll({
    where: {
      missionVehiculeId,
    },
    order: [
      ["date", "DESC"],
      ["createdAt", "DESC"],
    ],
  });

  return pleins.map(serializePlein);
};

export const addConducteurPleinService = async (
  missionVehiculeId,
  userId,
  payload,
) => {
  await getMissionVehiculeForConducteur(missionVehiculeId, userId, []);

  if (!payload || !hasField(payload, "litres")) {
    throw createError("La quantité de carburant est obligatoire.", 400);
  }

  const plein = await MissionsVehiculesPlein.create({
    missionVehiculeId,
    litres: parsePositiveNumber(payload.litres, "La quantité de carburant"),
    date: parseDate(payload.date),
  });

  return serializePlein(plein);
};
