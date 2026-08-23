
export default function Etapes2Sections({
  compagniesSelectionneesIds,
  sectionsParCompagnie,
  sectionsSelectionnees,
  chargementSections,
  toggleSection,
  getCompagnie,
}) {
  if (compagniesSelectionneesIds.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm h-[720px] flex items-center justify-center p-6 text-center">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Sections</h2>
          <p className="mt-2 text-sm text-slate-500">
            Sélectionnez une compagnie pour afficher ses sections.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm h-[720px] flex flex-col overflow-hidden">
      <div className="px-5 py-5 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900">Sections</h2>
        <p className="text-sm text-slate-500 mt-1">
          Choisissez les sections qui participeront à la mission.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {compagniesSelectionneesIds.map((compagnieId) => {
          const compagnie = getCompagnie(compagnieId);
          const sections = sectionsParCompagnie[compagnieId] || [];

          return (
            <div key={compagnieId}>
              <h3 className="font-semibold text-slate-700 mb-3">
                {compagnie?.nom}
              </h3>

              {chargementSections[compagnieId] ? (
                <p className="text-sm text-slate-500">Chargement des sections...</p>
              ) : (
                <div className="space-y-2">
                  {sections.map((section) => {
                    const selection = sectionsSelectionnees?.[compagnieId];
                    const selectionnee = selection instanceof Set
                      ? selection.has(section.id)
                      : Array.isArray(selection)
                        ? selection.some((s) => (typeof s === "object" ? s.id : s) === section.id)
                        : false;

                    return (
                      <label
                        key={section.id}
                        className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-all ${selectionnee ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50 hover:border-slate-300'}`}
                      >
                        <input
                          type="checkbox"
                          checked={selectionnee}
                          onChange={() =>
                            toggleSection(compagnieId, {
                              id: section.id,
                              compagnieId,
                              sectionName: section.sectionName,
                            })
                          }
                          className="h-4 w-4"
                        />

                        <span className="font-medium text-slate-800">
                          {section.sectionName}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}