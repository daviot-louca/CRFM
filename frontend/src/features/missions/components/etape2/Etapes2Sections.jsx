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
      <div className="flex h-[560px] min-w-0 items-center justify-center rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm sm:h-[620px] sm:p-6 lg:h-[720px]">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-slate-800 sm:text-lg">
            Sections
          </h2>

          <p className="mt-2 text-xs leading-relaxed text-slate-500 sm:text-sm">
            Sélectionnez une compagnie pour afficher ses sections.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[560px] min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:h-[620px] lg:h-[720px]">
      <div className="border-b border-slate-200 px-4 py-4 sm:px-5 sm:py-5">
        <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
          Sections
        </h2>

        <p className="mt-1 text-xs leading-relaxed text-slate-500 sm:text-sm">
          Choisissez les sections qui participeront à la mission.
        </p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-3 sm:space-y-6 sm:p-4">
        {compagniesSelectionneesIds.map((compagnieId) => {
          const compagnie = getCompagnie(compagnieId);
          const sections =
            sectionsParCompagnie[compagnieId] || [];

          return (
            <div key={compagnieId} className="min-w-0">
              <h3 className="mb-3 break-words text-sm font-semibold text-slate-700 sm:text-base">
                {compagnie?.nom}
              </h3>

              {chargementSections[compagnieId] ? (
                <p className="text-xs text-slate-500 sm:text-sm">
                  Chargement des sections...
                </p>
              ) : (
                <div className="space-y-2">
                  {sections.map((section) => {
                    const selection =
                      sectionsSelectionnees?.[compagnieId];

                    const selectionnee =
                      selection instanceof Set
                        ? selection.has(section.id)
                        : Array.isArray(selection)
                          ? selection.some(
                              (s) =>
                                (typeof s === "object"
                                  ? s.id
                                  : s) === section.id
                            )
                          : false;

                    return (
                      <label
                        key={section.id}
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
                            toggleSection(compagnieId, {
                              id: section.id,
                              compagnieId,
                              sectionName:
                                section.sectionName,
                            })
                          }
                          className="h-5 w-5 shrink-0 sm:h-4 sm:w-4"
                        />

                        <span className="min-w-0 break-words text-sm font-medium text-slate-800 sm:text-base">
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