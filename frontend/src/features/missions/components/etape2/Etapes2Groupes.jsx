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
    (usersSelectionnesIds ?? []).map((id) =>
      String(id)
    )
  );

  const utilisateursSelectionnes =
    usersDisponibles.filter((user) =>
      idsSelectionnes.has(String(user.id))
    );
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm h-[720px] flex flex-col overflow-hidden">
      <header className="px-5 py-5 border-b flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Groupes
          </h2>

          <p className="text-gray-600 mt-1">
            Créez vos groupes ou modifiez les groupes générés automatiquement.
          </p>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
            Total : {groupesManuels.length}
          </div>

          <button
            type="button"
            onClick={creerGroupeManuel}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
          >
            + Nouveau groupe
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        {groupesManuels.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
            Aucun groupe n'a été créé.
            <br />
            Cliquez sur{" "}
            <strong>+ Nouveau groupe</strong>{" "}
            pour commencer.
          </div>
        ) : (
          <div className="space-y-6">
            {groupesManuels.map(
              (groupe, index) => {
                const usersDuGroupe =
                  Array.isArray(
                    groupe.users,
                  )
                    ? groupe.users
                    : [];
                return (
                  <div
                    key={index}
                    className="rounded-3xl border border-slate-200 bg-white shadow-md p-6 hover:shadow-lg transition-all"
                  >
                    <div className="space-y-3">
                      {groupe.automatique && (
                        <div className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                          Groupe automatique
                        </div>
                      )}

                      {groupe.automatique ? (
                        <div className="bg-slate-100 border border-slate-200 rounded-2xl px-4 py-3 font-medium text-slate-700">
                          {groupe.nom}
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={groupe.nom}
                          onChange={(e) =>
                            renommerGroupe(
                              index,
                              e.target.value,
                            )
                          }
                          className="rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          placeholder="Nom du groupe"
                        />
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          supprimerGroupeManuel(
                            index,
                          )
                        }
                        className="rounded-2xl bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition py-3 w-full"
                      >
                        {groupe.automatique
                          ? "Supprimer le groupe automatique"
                          : "Supprimer le groupe"}
                      </button>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Militaires affectés
                      </p>

                      <div className="max-h-72 overflow-y-auto space-y-4 pr-1">
                      {utilisateursSelectionnes.map(
                          (user) => {
                            const fullName =
                              getNomComplet
                                ? getNomComplet(
                                    user,
                                  )
                                : user.nom;

                            const selected =
                              usersDuGroupe.includes(
                                user.id,
                              );

                            return (
                              <label
                                key={user.id}
                                className={`w-full flex items-center gap-4 rounded-2xl border p-4 transition-all ${
                                  selected
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-slate-200 hover:border-blue-200 hover:bg-slate-50"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  className="h-5 w-5"
                                  checked={
                                    selected
                                  }
                                  onChange={() => {
                                    toggleUserDansGroupe(
                                      index,
                                      user.id,
                                    );
                                  }}
                                />

                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-300 text-gray-700 font-semibold uppercase select-none">
                                  {fullName
                                    .charAt(
                                      0,
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="truncate text-gray-800 font-semibold">
                                    {fullName}
                                  </div>
                                </div>
                              </label>
                            );
                          },
                        )}
                      </div>
                    </div>
                  </div>
                );
              },
            )}
          </div>
        )}
      </div>
    </div>
  );
}