import { useState } from "react";

export default function Etapes3CompagnieVehicules({
  compagnie,
  vehicules = [],
  vehiculesSelectionnes = [],
  toggleVehicule,
}) {
  const selectedIds = vehiculesSelectionnes.map(
    (v) => v.vehiculeId,
  );

  const [ouvert, setOuvert] = useState(true);
  const [recherche, setRecherche] = useState("");

  const vehiculesDuGroupe = vehicules.filter(
    (vehicule) => {
      const affectation =
        vehiculesSelectionnes.find(
          (v) => v.vehiculeId === vehicule.id,
        );

      return (
        !affectation ||
        (
          affectation.compagnieId === compagnie.compagnieId &&
          affectation.groupeId === compagnie.groupeId
        )
      );
    },
  );

  const vehiculesFiltres = vehiculesDuGroupe.filter(
    (vehicule) => {
      const rechercheNormalisee =
        recherche.trim().toLowerCase();

      if (!rechercheNormalisee) {
        return true;
      }

      const nom =
        vehicule.vehiculeName
          ?.toLowerCase() ?? "";

      const immatriculation =
        vehicule.immatriculation
          ?.toLowerCase() ?? "";

      return (
        nom.includes(rechercheNormalisee) ||
        immatriculation.includes(rechercheNormalisee)
      );
    },
  );

  return (
    <div className="p-4 sm:p-5">
      <button
        type="button"
        onClick={() => setOuvert(!ouvert)}
        className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-4 transition-all duration-200 hover:bg-slate-50 sm:px-5"
      >
        <div className="min-w-0 text-left">
          <h3 className="truncate text-base font-semibold text-slate-800 sm:text-lg">
            {compagnie.nomGroupe}
          </h3>

          <p className="text-xs text-slate-500 sm:text-sm">
            {compagnie.nomCompagnie}
          </p>

          <p className="text-xs text-slate-500 sm:text-sm">
            {vehiculesDuGroupe.length} véhicule
            {vehiculesDuGroupe.length > 1 ? "s" : ""}
          </p>
        </div>

        <svg
          className={`ml-3 h-5 w-5 shrink-0 text-slate-500 transition-transform duration-200 ${
            ouvert ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {ouvert && (
        <div className="mt-4 animate-in fade-in duration-200">

          {/* Barre de recherche */}
          <div className="mb-4">
            <label
              htmlFor={`recherche-vehicules-${compagnie.compagnieId}-${compagnie.groupeId}`}
              className="mb-1.5 block text-xs font-medium text-slate-700 sm:text-sm"
            >
              Rechercher un véhicule
            </label>

            <div className="relative">
              <input
                id={`recherche-vehicules-${compagnie.compagnieId}-${compagnie.groupeId}`}
                type="search"
                value={recherche}
                onChange={(e) =>
                  setRecherche(e.target.value)
                }
                placeholder="Nom ou immatriculation..."
                className="box-border block h-11 w-full min-w-0 max-w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-10 text-base outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 sm:h-10 sm:text-sm"
              />

              {recherche && (
                <button
                  type="button"
                  onClick={() => setRecherche("")}
                  aria-label="Effacer la recherche"
                  className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  ×
                </button>
              )}
            </div>

            {recherche.trim() && (
              <p className="mt-2 text-xs text-slate-500">
                {vehiculesFiltres.length} véhicule
                {vehiculesFiltres.length > 1 ? "s" : ""} trouvé
                {vehiculesFiltres.length > 1 ? "s" : ""}
              </p>
            )}
          </div>

          {/* Liste des véhicules */}
          <div className="space-y-2">
            {vehiculesFiltres.map((vehicule) => {
              const selected = selectedIds.includes(
                vehicule.id,
              );

              return (
                <label
                  key={vehicule.id}
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border bg-white px-4 py-4 shadow-sm transition-all duration-150 sm:px-5 ${
                    selected
                      ? "border-blue-400 bg-blue-50/50"
                      : "border-slate-200 hover:border-blue-300 hover:shadow-md"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800 sm:text-base">
                      {vehicule.vehiculeName}
                    </p>

                    <p className="truncate text-xs text-slate-500 sm:text-sm">
                      {vehicule.immatriculation}
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() =>
                      toggleVehicule(
                        vehicule.id,
                        compagnie.compagnieId,
                        compagnie.groupeId,
                      )
                    }
                    className="h-5 w-5 shrink-0 accent-blue-600"
                  />
                </label>
              );
            })}

            {vehiculesDuGroupe.length === 0 && (
              <p className="rounded-xl bg-slate-50 px-4 py-4 text-sm text-slate-500">
                Aucun véhicule disponible.
              </p>
            )}

            {vehiculesDuGroupe.length > 0 &&
              vehiculesFiltres.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center">
                  <p className="text-sm font-medium text-slate-600">
                    Aucun véhicule trouvé.
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Essayez avec un autre nom ou une autre immatriculation.
                  </p>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
}