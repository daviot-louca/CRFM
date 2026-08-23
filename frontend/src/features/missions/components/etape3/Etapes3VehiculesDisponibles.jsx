/*
 * Etapes3VehiculesDisponibles component
 *
 * @param {Object} props
 * @param {string} rechercheVehicule
 * @param {function} setRechercheVehicule
 * @param {Array} vehiculesFiltres
 * @param {Array} vehiculesSelectionnes
 * @param {function} toggleVehicule
 */
const Etapes3VehiculesDisponibles = ({
  rechercheVehicule = "",
  setRechercheVehicule,
  vehiculesFiltres = [],
  vehiculesSelectionnes = [],
  toggleVehicule,
}) => {
  const listeVehicules = Array.isArray(vehiculesFiltres) ? vehiculesFiltres : [];
  const selectedIds = Array.isArray(vehiculesSelectionnes)
    ? vehiculesSelectionnes.map((v) => v.vehiculeId)
    : [];
  return (
    <div className="bg-white rounded-xl shadow p-6 flex flex-col h-full">
      {/* Header */}
      <div className="mb-6">
        <div className="text-xs font-bold text-slate-700 tracking-widest uppercase mb-1">
          VÉHICULES DISPONIBLES
        </div>
        <div className="text-sm text-slate-500">
          Sélectionnez un ou plusieurs véhicules disponibles.
        </div>
      </div>
      {/* Search input */}
      <input
        type="text"
        placeholder="Rechercher un véhicule..."
        value={rechercheVehicule}
        autoComplete="off"
        onChange={(e) => {
          if (typeof setRechercheVehicule === 'function') {
            setRechercheVehicule(e.target.value);
          }
        }}
        className="w-full mb-4 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
      />
      {/* Vehicle list */}
      <div className="flex-1 overflow-y-auto max-h-[600px] pr-2">
        {listeVehicules.length === 0 && (
          <div className="text-center text-slate-400 py-10 text-sm">
            Aucun véhicule disponible.
          </div>
        )}
        <div className="space-y-3">
          {listeVehicules.map(vehicule => {
            const selected = selectedIds.includes(vehicule.id);
            return (
              <button
                key={vehicule.id}
                type="button"
                onClick={() =>
                  toggleVehicule(
                    vehicule.id,
                    vehicule.compagnieId ?? vehicule.compagnie?.id ?? null
                  )
                }
                className={
                  "w-full flex items-center px-4 py-3 rounded-lg border transition-colors text-left " +
                  (selected
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 hover:border-blue-300") +
                  " focus:outline-none focus:ring-2 focus:ring-blue-300"
                }
                tabIndex={0}
              >
                {/* Checkbox */}
                <span className="mr-4 flex-shrink-0">
	                  <input
	                    type="checkbox"
	                    checked={selected}
	                    readOnly
	                    className="form-checkbox h-5 w-5 text-blue-600 rounded border-slate-300"
	                    tabIndex={-1}
	                  />
                </span>
                {/* Thumbnail */}
                <span className="mr-4 shrink-0">
                  {vehicule?.vehiculeType?.UrlImage ? (
                    <img
                      src={vehicule.vehiculeType.UrlImage}
                      alt={vehicule.nom || vehicule?.vehiculeName || 'Véhicule'}
                      className="w-12 h-12 rounded-lg object-cover bg-slate-100"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-xl">
                      🚚
                    </div>
                  )}
                </span>
                {/* Name & registration */}
                <span className="flex flex-col grow min-w-0">
                  <span className="font-semibold text-slate-700 truncate">
                    {vehicule.nom || vehicule?.vehiculeName}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
      {/* Bottom info */}
      <div className="mt-4 text-center text-xs text-slate-400">
        {listeVehicules.length} véhicule(s) disponible(s)
      </div>
    </div>
  );
};

export default Etapes3VehiculesDisponibles;
