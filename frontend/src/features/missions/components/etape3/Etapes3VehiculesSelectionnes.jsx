
export default function Etapes3VehiculesSelectionnes({
    vehicules,
    vehiculesSelectionnes,
    toggleVehicule,
}) {
    const selectedIds = Array.isArray(vehiculesSelectionnes)
        ? vehiculesSelectionnes.map((v) => v.vehiculeId)
        : [];

    const selectedVehicules =
        Array.isArray(vehicules)
            ? vehicules.filter((v) => selectedIds.includes(v.id))
            : [];

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-full flex flex-col">
            {/* Header */}
            <div className="mb-6">
                <div className="text-xs font-semibold text-slate-500 tracking-widest uppercase">
                    VÉHICULES SÉLECTIONNÉS
                </div>
                <div className="text-sm text-slate-400 mt-1">
                    Véhicules retenus pour cette mission.
                </div>
            </div>
            {/* Content */}
            <div className="flex-1 flex flex-col">
                {selectedVehicules.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center text-slate-400">
                        <div className="text-5xl mb-2">🚚</div>
                        <div className="text-base font-medium">
                            Aucun véhicule sélectionné.
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto max-h-[600px] space-y-4 pr-2">
                        {selectedVehicules.map((vehicule) => (
                            <div
                                key={vehicule.id}
                                className="flex items-center bg-slate-50 rounded-xl px-4 py-3 border border-slate-100"
                            >
                                <div className="w-12 h-12 flex items-center justify-center bg-slate-200 rounded-lg mr-4 overflow-hidden">
                                    {vehicule?.vehiculeType?.UrlImage ? (
                                        <img
                                            src={vehicule.vehiculeType.UrlImage}
                                            alt={vehicule.nom || vehicule?.vehiculeName || "Véhicule"}
                                            className="object-cover w-full h-full"
                                        />
                                    ) : (
                                        <span className="text-xl">🚚</span>
                                    )}
                                </div>
                                {/* Infos */}
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-slate-700 truncate">
                                        {vehicule.nom || vehicule.vehiculeName || vehicule.name || "Véhicule"}
                                    </div>
                                    <div className="text-xs text-slate-500 truncate">
                                        {vehicule.immatriculation || vehicule.registration}
                                    </div>
                                </div>
                                {/* Badge */}
                                <div className="ml-4">
                                    <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                                        Disponible
                                    </span>
                                </div>
                                {/* Remove button */}
                                <button
                                    type="button"
                                    className="ml-4 flex items-center text-red-600 hover:text-red-800 text-sm font-medium px-2 py-1 rounded transition-colors"
                                    onClick={() => toggleVehicule(vehicule.id, null)}
                                >
                                    <svg
                                        className="h-4 w-4 mr-1"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                    Retirer
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
