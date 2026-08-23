export default function Etapes2Compagnies({
  compagniesFiltrees,
  compagniesSelectionneesIds,
  rechercheCompagnie,
  setRechercheCompagnie,
  toggleCompagnie,
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm h-[720px] flex flex-col overflow-hidden">
      <div className="px-5 py-5 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900">Compagnies</h2>
        <p className="text-sm text-slate-500 mt-1">
          Sélectionnez une ou plusieurs compagnies.
        </p>
      </div>

      <div className="p-5 border-b border-slate-100">
        <input
          type="text"
          value={rechercheCompagnie}
          onChange={(e) => setRechercheCompagnie(e.target.value)}
          placeholder="Rechercher une compagnie..."
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {compagniesFiltrees.map((compagnie) => {
          const selectionnee = compagniesSelectionneesIds.includes(compagnie.id);

          return (
            <label
              key={compagnie.id}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-all ${selectionnee ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
            >
              <input
                type="checkbox"
                checked={selectionnee}
                onChange={() => toggleCompagnie(compagnie.id)}
                className="h-4 w-4"
              />

              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 truncate">
                  {compagnie.nom}
                </p>
              </div>

              {selectionnee && (
                <div className="h-2.5 w-2.5 rounded-full bg-blue-600" />
              )}
            </label>
          );
        })}
      </div>
    </div>
  );
}
