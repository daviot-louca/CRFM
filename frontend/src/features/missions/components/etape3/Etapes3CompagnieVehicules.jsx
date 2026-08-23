import { useState } from "react";
export default function Etapes3CompagnieVehicules({
  compagnie,
  vehicules = [],
  vehiculesSelectionnes = [],
  toggleVehicule,
}) {
  const selectedIds = vehiculesSelectionnes.map((v) => v.vehiculeId);
  const [ouvert, setOuvert] = useState(true);

  const vehiculesDeLaCompagnie = vehicules.filter((vehicule) => {
    const affectation = vehiculesSelectionnes.find(
      (v) => v.vehiculeId === vehicule.id
    );

    return (
      !affectation ||
      affectation.compagnieId === compagnie.compagnieId
    );
  });
  console.log(compagnie)
  return (
    <div className=" p-5">
      <button
        type="button"
        onClick={() => setOuvert(!ouvert)}
        className="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 hover:bg-slate-50 transition-all duration-200"
      >
        <div className="text-left">
          <h3 className="text-lg font-semibold text-slate-800">
            {compagnie.nomCompagnie}
          </h3>
          <p className="text-sm text-slate-500">
            {vehiculesDeLaCompagnie.length} véhicule{vehiculesDeLaCompagnie.length > 1 ? 's' : ''}
          </p>
        </div>

        <svg
          className={`h-5 w-5 text-slate-500 transition-transform duration-200 ${ouvert ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {ouvert && (
        <div className="mt-4 animate-in fade-in duration-200">
          <div className="space-y-2">
            {vehiculesDeLaCompagnie.map((vehicule) => {
              const selected = selectedIds.includes(vehicule.id);

              return (
                <label
                  key={vehicule.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition-all duration-150 hover:border-blue-300 hover:shadow-md cursor-pointer"
                >
                  <div>
                    <p className="font-medium">{vehicule.vehiculeName}</p>
                    <p className="text-sm text-slate-500">
                      {vehicule.immatriculation}
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() =>
                      toggleVehicule(vehicule.id, compagnie.compagnieId)
                    }
                    className="accent-blue-600 h-5 w-5"
                  />
                </label>
              );
            })}

            {vehiculesDeLaCompagnie.length === 0 && (
              <p className="text-sm text-slate-500">
                Aucun véhicule disponible.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}