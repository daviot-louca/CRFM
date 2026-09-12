export default function Etapes2Groupes({
  groupesManuels,
  creerGroupeManuel,
  supprimerGroupeManuel,
  renommerGroupe,
  toggleUserDansGroupe,
  usersDisponibles = [],
  usersSelectionnesIds = [],
  getNomComplet,
}) {
  const idsSelectionnes = new Set(
    (usersSelectionnesIds ?? []).map((id) => String(id))
  );

  const utilisateursSelectionnes = usersDisponibles.filter((user) =>
    idsSelectionnes.has(String(user.id))
  );

  return (
    <div className="flex h-[560px] min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:h-[620px] lg:h-[720px]">
      <header className="flex flex-col gap-4 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5 sm:py-5">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
            Groupes
          </h2>

          <p className="mt-1 text-xs leading-relaxed text-gray-600 sm:text-sm">
            Créez vos groupes ou modifiez les groupes générés automatiquement.
          </p>
        </div>

        <div className="flex w-full flex-row items-center justify-between gap-2 sm:w-auto sm:flex-col sm:items-end">
          <div className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
            Total : {groupesManuels.length}
          </div>

          <button
            type="button"
            onClick={creerGroupeManuel}
            className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 sm:px-4 sm:text-sm"
          >
            + Nouveau groupe
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-3 sm:p-4">
        {groupesManuels.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500 sm:p-8">
            Aucun groupe n'a été créé.
            <br />
            Cliquez sur <strong>+ Nouveau groupe</strong> pour commencer.
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {groupesManuels.map((groupe, index) => {
              const usersDuGroupe = Array.isArray(groupe.users)
                ? groupe.users
                : [];

              return (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 bg-white p-3 shadow-md transition-all hover:shadow-lg sm:rounded-3xl sm:p-6"
                >
                  <div className="space-y-3">
                    {groupe.automatique && (
                      <div className="inline-flex max-w-full rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        Groupe automatique
                      </div>
                    )}

                    {groupe.automatique ? (
                      <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-100 px-3 py-3 text-sm font-medium break-words text-slate-700 sm:px-4">
                        {groupe.nom}
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={groupe.nom}
                        onChange={(e) =>
                          renommerGroupe(index, e.target.value)
                        }
                        className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 sm:px-4"
                        placeholder="Nom du groupe"
                      />
                    )}

                    <button
                      type="button"
                      onClick={() => supprimerGroupeManuel(index)}
                      className="w-full rounded-2xl border border-red-200 bg-red-50 py-3 text-sm text-red-600 transition hover:bg-red-100"
                    >
                      {groupe.automatique
                        ? "Supprimer le groupe automatique"
                        : "Supprimer le groupe"}
                    </button>
                  </div>

                  <div className="mt-4">
                    <p className="mb-2 text-sm font-medium text-gray-700">
                      Militaires affectés
                    </p>

                    <div className="max-h-64 space-y-2 overflow-y-auto pr-1 sm:max-h-72 sm:space-y-4">
                      {utilisateursSelectionnes.map((user) => {
                        const fullName = getNomComplet
                          ? getNomComplet(user)
                          : user.nom;

                        const selected = usersDuGroupe.includes(user.id);

                        return (
                          <label
                            key={user.id}
                            className={`flex w-full min-w-0 cursor-pointer items-center gap-3 rounded-2xl border p-3 transition-all sm:gap-4 sm:p-4 ${
                              selected
                                ? "border-blue-500 bg-blue-50"
                                : "border-slate-200 hover:border-blue-200 hover:bg-slate-50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="h-5 w-5 shrink-0"
                              checked={selected}
                              onChange={() =>
                                toggleUserDansGroupe(index, user.id)
                              }
                            />

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-300 text-sm font-semibold uppercase text-gray-700 select-none sm:h-10 sm:w-10">
                              {fullName.charAt(0)}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="break-words text-sm font-semibold text-gray-800 sm:text-base">
                                {fullName}
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}