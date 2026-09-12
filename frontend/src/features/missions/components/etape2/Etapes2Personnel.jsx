export default function Etapes2Personnel({
  sectionsParCompagnie,
  sectionsSelectionnees,
  usersParSection,
  usersSelectionnes,
  recherchePersonnel,
  setRecherchePersonnel,
  chargementUsers,
  toggleUser,
  selectAllUsers,
  getNomComplet,
  filtrerPersonnel,
}) {
  return (
    <div className="flex h-[560px] min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:h-[620px] lg:h-[720px]">
      <div className="px-4 pt-4 pb-3 sm:px-6 sm:pt-6 sm:pb-4">
        <h2 className="mb-1 text-xl font-bold text-gray-900 sm:text-2xl">
          Personnel
        </h2>

        <p className="text-xs leading-relaxed text-gray-500 sm:text-sm">
          Sélectionnez les militaires participant à la mission.
        </p>
      </div>

      <div className="border-y border-slate-200 px-4 py-3 sm:px-6 sm:py-4">
        <input
          type="text"
          placeholder="Rechercher un militaire..."
          value={recherchePersonnel}
          onChange={(e) =>
            setRecherchePersonnel(e.target.value)
          }
          className="w-full rounded-xl border border-gray-300 px-3 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 sm:px-4"
        />
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-3 sm:space-y-6 sm:p-4">
        {Object.entries(
          sectionsParCompagnie || {}
        ).map(([compagnieId, sections]) =>
          sections
            .filter((section) => {
              const selection =
                sectionsSelectionnees?.[compagnieId];

              if (selection instanceof Set) {
                return selection.has(section.id);
              }

              if (Array.isArray(selection)) {
                return selection.some(
                  (s) =>
                    (typeof s === "object"
                      ? s.id
                      : s) === section.id
                );
              }

              return false;
            })
            .map((section) => {
              const users = filtrerPersonnel(
                usersParSection[section.id] || [],
                recherchePersonnel
              );

              const selectedSet =
                usersSelectionnes[section.id] ||
                new Set();

              return (
                <div
                  key={section.id}
                  className="min-w-0 space-y-3"
                >
                  <div className="sticky top-0 z-10 flex flex-col gap-2 rounded-xl bg-slate-100 px-3 py-3 font-semibold text-gray-900 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-2">
                    <span className="min-w-0 break-words text-sm sm:text-base">
                      {section.sectionName ||
                        section.nom}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        selectAllUsers(section.id)
                      }
                      className="w-full rounded-xl bg-blue-600 px-3 py-2.5 text-xs text-white transition hover:bg-blue-700 sm:w-auto sm:px-4 sm:text-sm"
                    >
                      Tout sélectionner
                    </button>
                  </div>

                  {chargementUsers[section.id] ? (
                    <div className="flex items-center justify-center py-8 text-center text-sm text-gray-400">
                      Chargement des militaires...
                    </div>
                  ) : !users.length ? (
                    <div className="rounded-xl bg-gray-50 p-4 text-center text-sm text-gray-400">
                      Aucun militaire trouvé.
                    </div>
                  ) : (
                    <div className="space-y-2 sm:space-y-3">
                      {users.map((user) => {
                        const isSelected =
                          selectedSet.has(user.id);

                        return (
                          <div
                            key={user.id}
                            className={`flex min-w-0 cursor-pointer items-center gap-3 rounded-xl border p-3 transition hover:bg-slate-50 sm:p-4 ${
                              isSelected
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200"
                            }`}
                            onClick={() =>
                              toggleUser(
                                section.id,
                                user.id
                              )
                            }
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                e.stopPropagation();

                                toggleUser(
                                  section.id,
                                  user.id
                                );
                              }}
                              id={`user-${section.id}-${user.id}`}
                              className="h-5 w-5 shrink-0"
                            />

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700 select-none sm:h-10 sm:w-10">
                              {getNomComplet(user)
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div className="min-w-0 flex-1">
                              <span className="block break-words text-sm font-medium text-gray-900 sm:text-base">
                                {getNomComplet(user)}
                              </span>

                              <span className="mt-0.5 block truncate text-xs text-gray-500 sm:text-sm">
                                {section.sectionName ||
                                  section.nom}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
        )}
      </div>
    </div>
  );
}