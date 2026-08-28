export const getApiErrorMessage = (
  error,
  fallback = "Une erreur est survenue.",
) => {
  return error?.response?.data?.error ?? error?.message ?? fallback;
};

export const formatDate = (date) => {
  if (!date) {
    return "Non renseignée";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
};

export const formatDateTime = (date) => {
  if (!date) {
    return "Non renseignée";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

export const formatNumber = (value, suffix = "") => {
  if (value === null || value === undefined || value === "") {
    return "Non renseigné";
  }

  return `${new Intl.NumberFormat("fr-FR").format(Number(value))}${suffix}`;
};

export const getReleveUnit = (modeReleve) => {
  return modeReleve === "horametre" ? " h" : " km";
};

export const getReleveLabels = (modeReleve) => {
  if (modeReleve === "horametre") {
    return {
      depart: "Horamètre de départ",
      arrivee: "Horamètre d'arrivée",
      unit: "h",
    };
  }

  return {
    depart: "Kilométrage de départ",
    arrivee: "Kilométrage d'arrivée",
    unit: "km",
  };
};

export const parseNumberInput = (
  value,
  label,
  { required = false, strictlyPositive = false } = {},
) => {
  const normalizedValue = String(value ?? "").trim().replace(",", ".");

  if (!normalizedValue) {
    if (required) {
      throw new Error(`${label} est obligatoire.`);
    }

    return null;
  }

  const parsedValue = Number(normalizedValue);

  if (!Number.isFinite(parsedValue)) {
    throw new Error(`${label} doit être numérique.`);
  }

  if (strictlyPositive && parsedValue <= 0) {
    throw new Error(`${label} doit être supérieur à 0.`);
  }

  if (!strictlyPositive && parsedValue < 0) {
    throw new Error(`${label} ne peut pas être négatif.`);
  }

  return parsedValue;
};

export const getStatutClasses = (statut) => {
  if (statut === "Terminé") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (statut === "Départ renseigné" || statut === "Mission en cours") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-gray-200 bg-gray-50 text-gray-600";
};
