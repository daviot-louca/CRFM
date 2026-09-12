export default function Etapes2Compagnies({
  compagniesFiltrees,
  compagniesSelectionneesIds,
  rechercheCompagnie,
  setRechercheCompagnie,
  toggleCompagnie,
}) {
  return (
    <div className="flex h-[560px] min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:h-[620px] lg:h-[720px]">
      <div className="border-b border-slate-200 px-4 py-4 sm:px-5 sm:py-5">
        <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
          Compagnies
        </h2>

        <p className="mt-1 text-xs leading-relaxed text-slate-500 sm:text-sm">
          Sélectionnez une ou plusieurs compagnies.
        </p>
      </div>

      <div className="border-b border-slate-100 p-4 sm:p-5">
        <input
          type="text"
          value={rechercheCompagnie}
          onChange={(e) => setRechercheCompagnie(e.target.value)}
          placeholder="Rechercher une compagnie..."
          className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 sm:px-4"
        />
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-3 sm:p-4">
        {compagniesFiltrees.map((compagnie) => {
          const selectionnee =
            compagniesSelectionneesIds.includes(compagnie.id);

          return (
            <label
              key={compagnie.id}
              className={`flex min-w-0 cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 transition-all sm:px-4 ${
                selectionnee
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <input
                type="checkbox"
                checked={selectionnee}
                onChange={() =>
                  toggleCompagnie(compagnie.id)
                }
                className="h-5 w-5 shrink-0 sm:h-4 sm:w-4"
              />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800 sm:text-base">
                  {compagnie.nom}
                </p>
              </div>

              {selectionnee && (
                <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600" />
              )}
            </label>
          );
        })}
      </div>
    </div>
  );
}