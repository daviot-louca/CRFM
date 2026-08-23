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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm h-[720px] flex flex-col overflow-hidden">
      <div className="px-6 pt-6 pb-2">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Personnel</h2>
        <p className="text-gray-500">Sélectionnez les militaires participant à la mission.</p>
      </div>
      <div className="border-y border-slate-200 px-6 py-4">
        <input
          type="text"
          placeholder="Rechercher un militaire..."
          value={recherchePersonnel}
          onChange={e => setRecherchePersonnel(e.target.value)}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
        />
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {Object.entries(sectionsParCompagnie || {}).map(([compagnieId, sections]) =>
          sections
            .filter((section) => {
              const selection = sectionsSelectionnees?.[compagnieId];

              if (selection instanceof Set) {
                return selection.has(section.id);
              }

              if (Array.isArray(selection)) {
                return selection.some(
                  (s) => (typeof s === "object" ? s.id : s) === section.id
                );
              }

              return false;
            })
            .map(section => {
              const users = filtrerPersonnel(usersParSection[section.id] || [], recherchePersonnel);
              const selectedSet = usersSelectionnes[section.id] || new Set();
              return (
                <div key={section.id} className="space-y-3">
                  <div className="sticky top-0 z-10 flex items-center justify-between rounded-xl bg-slate-100 px-4 py-2 font-semibold text-gray-900">
                    <span>{section.sectionName || section.nom}</span>
                    <button
                      type="button"
                      onClick={() => selectAllUsers(section.id)}
                      className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
                    >
                      Tout sélectionner
                    </button>
                  </div>
                  {chargementUsers[section.id] ? (
                    <div className="flex justify-center items-center text-gray-400 py-8">
                      Chargement des militaires...
                    </div>
                  ) : !users.length ? (
                    <div className="rounded-xl bg-gray-50 text-gray-400 text-center p-4">
                      Aucun militaire trouvé.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {users.map(user => {
                        const isSelected = selectedSet.has(user.id);
                        return (
                          <div
                            key={user.id}
                            className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer hover:bg-slate-50 transition ${
                              isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200"
                            }`}
                            onClick={() => toggleUser(section.id, user.id)}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={e => {
                                e.stopPropagation();
                                toggleUser(section.id, user.id);
                              }}
                              id={`user-${section.id}-${user.id}`}
                              className="h-5 w-5"
                            />
                            <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center font-semibold text-slate-700 select-none">
                              {getNomComplet(user).charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-900">{getNomComplet(user)}</span>
                              <span className="text-sm text-gray-500">{section.sectionName || section.nom}</span>
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
