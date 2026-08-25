import { useMemo } from "react";
import { useMissions2 } from "../hooks/useMissions2";
import MainLayout from "@/components/layout/MainLayout";
import { useNavigate } from "react-router-dom";
import { updateMissionConducteurs } from "../api/missions.api";
function CreerMission4Admin() {
  const navigate = useNavigate();

  const {
    missionId,
    groupes = [],
    groupesManuels = [],
    creerGroupeManuel,
    setSoa,
    toggleConducteur,
    usersDisponibles = [],
    vehiculesSelectionnes = [],
    vehicules = [],
    setConducteurVehicule,
  } = useMissions2();

  const vehiculesDisponibles = useMemo(() => {
    const selectionIds = new Set(
      (vehiculesSelectionnes ?? []).map((selection) =>
        typeof selection === "string"
          ? selection
          : selection.vehiculeId
      )
    );

    if (selectionIds.size === 0) {
      return [];
    }

    return (vehicules ?? []).filter((vehicule) =>
      selectionIds.has(vehicule.id)
    );
  }, [vehicules, vehiculesSelectionnes]);

  const getUserLabel = (user) => {
    const grade = user.grade ?? "";

    const nom =
      user.nom ??
      user.lastName ??
      user.lastname ??
      "";

    const prenom =
      user.prenom ??
      user.firstName ??
      user.firstname ??
      "";

    return `${grade} ${prenom} ${nom}`.trim();
  };

  const getVehiculeLabel = (vehicule) => {
    const type =
      vehicule.vehiculeType?.nom ??
      vehicule.vehiculeType?.name ??
      vehicule.type?.nom ??
      vehicule.type?.name ??
      vehicule.vehiculeName ??
      vehicule.nom ??
      vehicule.name ??
      "Véhicule";

    const immatriculation =
      vehicule.immatriculation ??
      vehicule.registration ??
      vehicule.plaque ??
      "";

    return immatriculation
      ? `${type} - ${immatriculation}`
      : type;
  };

  const getConducteursDisponibles = (groupe) => {
    const ids = new Set(groupe.users ?? []);

    return usersDisponibles.filter((user) =>
      ids.has(user.id)
    );
  };

  /*
   * ==========================================
   * VÉHICULES DU GROUPE
   * ==========================================
   *
   * On récupère uniquement les véhicules dont
   * l'affectation possède le même groupeId.
   *
   * Ainsi :
   *
   * Groupe 1 → véhicules du groupe 1
   * Groupe 2 → véhicules du groupe 2
   *
   * Même si les deux groupes appartiennent
   * à la même compagnie, leurs véhicules
   * restent séparés.
   */

  const getVehiculesDuGroupe = (groupe) => {
    const groupeId =
      groupe.id ??
      groupe.groupeId;

    if (!groupeId) {
      return [];
    }

    const idsDuGroupe = new Set(
      (vehiculesSelectionnes ?? [])
        .filter(
          (selection) =>
            typeof selection !== "string" &&
            selection.groupeId === groupeId
        )
        .map(
          (selection) =>
            selection.vehiculeId
        )
    );

    return vehiculesDisponibles.filter(
      (vehicule) =>
        idsDuGroupe.has(vehicule.id)
    );
  };

  /*
   * ==========================================
   * CONDUCTEUR DU VÉHICULE
   * ==========================================
   *
   * On cherche également avec le groupeId
   * afin qu'un conducteur affecté dans un
   * groupe ne soit pas affiché dans un autre.
   */

  const getConducteurId = (
    vehiculeId,
    groupeId
  ) => {
    const selection = (
      vehiculesSelectionnes ?? []
    ).find(
      (item) =>
        typeof item !== "string" &&
        item.vehiculeId === vehiculeId &&
        item.groupeId === groupeId
    );

    return selection?.conducteurId ?? "";
  };

  const handleConducteurChange = (
    vehiculeId,
    conducteurId
  ) => {
    setConducteurVehicule(
      vehiculeId,
      conducteurId
    );
  };

  /*
   * On utilise les groupes complets si
   * disponibles.
   *
   * Fallback sur groupesManuels pour
   * conserver la compatibilité.
   */

  const handleContinuer = async () => {
    if (!missionId) {
      alert(
        "Aucune mission n'est actuellement sélectionnée."
      );
      return;
    }

    const affectationsVehicules = (
      vehiculesSelectionnes ?? []
    )
      .filter(
        (selection) =>
          typeof selection !== "string" &&
          selection.vehiculeId
      )
      .map((selection) => ({
        vehiculeId: selection.vehiculeId,
        compagnieId:
          selection.compagnieId ?? null,
        groupeId:
          selection.groupeId ??
          selection.missionGroupeId ??
          null,
        conducteurId:
          selection.conducteurId ?? null,
      }));

    const affectationsSansConducteur =
      affectationsVehicules.filter(
        (affectation) =>
          !affectation.conducteurId
      );

    if (
      affectationsSansConducteur.length > 0
    ) {
      alert(
        "Chaque véhicule doit avoir un conducteur avant de continuer."
      );
      return;
    }

    try {
      console.log(
        "[ÉTAPE 4] Sauvegarde des conducteurs :",
        affectationsVehicules
      );

      await updateMissionConducteurs(
        missionId,
        affectationsVehicules
      );

      console.log(
        "[ÉTAPE 4] Conducteurs sauvegardés avec succès"
      );

      navigate(
        "/admin/validation-missions"
      );
    } catch (error) {
      console.error(
        "[ÉTAPE 4] Erreur lors de la sauvegarde :",
        error
      );

      alert(
        error?.response?.data?.message ??
        error?.message ??
        "Impossible de sauvegarder les conducteurs."
      );
    }
  };

  const groupesAAfficher =
    groupes.length > 0
      ? groupes
      : groupesManuels;

  return (
    <MainLayout>
      <div className="p-6">
        <h1 className="mb-6 text-2xl font-bold">
          Commandement
        </h1>

        <div className="flex gap-4 overflow-x-auto pb-4">
          {groupesAAfficher.map(
            (groupe, index) => {
              const conducteursDuGroupe =
                getConducteursDisponibles(
                  groupe
                );

              const vehiculesDuGroupe =
                getVehiculesDuGroupe(
                  groupe
                );

              const groupeId =
                groupe.id ??
                groupe.groupeId;

              return (
                <div
                  key={
                    groupeId ??
                    `groupe-${index}`
                  }
                  className="flex w-80 shrink-0 flex-col gap-2 rounded-lg border p-4"
                >
                  <h2 className="text-lg font-semibold">
                    {groupe.nom ??
                      groupe.nomGroupe ??
                      `Groupe ${index + 1}`}
                  </h2>

                  {(groupe.societe ||
                    groupe.section ||
                    groupe.nomCompagnie) && (
                      <p className="text-sm text-gray-600">
                        {groupe.societe
                          ? `Société: ${groupe.societe}`
                          : groupe.nomCompagnie
                            ? `Compagnie: ${groupe.nomCompagnie}`
                            : ""}

                        {(groupe.societe ||
                          groupe.nomCompagnie) &&
                          groupe.section
                          ? " - "
                          : ""}

                        {groupe.section
                          ? `Section: ${groupe.section}`
                          : ""}
                      </p>
                    )}

                  {/* SOA */}

                  <p className="text-sm font-medium">
                    SOA
                  </p>

                  <select
                    className="w-full rounded border p-2"
                    value={
                      groupe.soaId ?? ""
                    }
                    onChange={(e) =>
                      setSoa(
                        index,
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      Sélectionner un SOA
                    </option>

                    {(groupe.users ?? []).map(
                      (userId) => {
                        const user =
                          usersDisponibles.find(
                            (u) =>
                              u.id ===
                              userId
                          );

                        if (!user) {
                          return null;
                        }

                        const memeCompagnie =
                          !groupe.societe ||
                          user.compagnieName ===
                          groupe.societe ||
                          user.compagnie
                            ?.compagnieName ===
                          groupe.societe;

                        const estSOA =
                          user.roleName ===
                          "SOA" ||
                          user.role?.roleName ===
                          "SOA";

                        if (
                          !memeCompagnie ||
                          !estSOA
                        ) {
                          return null;
                        }

                        return (
                          <option
                            key={user.id}
                            value={user.id}
                          >
                            {getUserLabel(
                              user
                            )}
                          </option>
                        );
                      }
                    )}
                  </select>

                  {/* Conducteurs */}

                  <p className="mt-4 text-sm font-medium">
                    Conducteurs disponibles
                  </p>

                  <div className="space-y-2">
                    {(groupe.users ?? []).map(
                      (userId) => {
                        const user =
                          usersDisponibles.find(
                            (u) =>
                              u.id ===
                              userId
                          );

                        if (!user) {
                          return null;
                        }

                        return (
                          <label
                            key={user.id}
                            className="flex items-center gap-2 text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={(
                                groupe.conducteurIds ??
                                []
                              ).includes(
                                user.id
                              )}
                              onChange={() =>
                                toggleConducteur(
                                  index,
                                  user.id
                                )
                              }
                            />

                            {getUserLabel(
                              user
                            )}
                          </label>
                        );
                      }
                    )}
                  </div>

                  {/* Véhicules */}

                  <div className="mt-5 border-t pt-4">
                    <p className="mb-3 text-sm font-medium">
                      Véhicules / conducteurs
                    </p>

                    {vehiculesDuGroupe.length ===
                      0 ? (
                      <p className="text-sm text-gray-500">
                        Aucun véhicule sélectionné
                        pour ce groupe.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {vehiculesDuGroupe.map(
                          (vehicule) => {
                            const conducteurId =
                              getConducteurId(
                                vehicule.id,
                                groupeId
                              );

                            return (
                              <div
                                key={
                                  vehicule.id
                                }
                                className="rounded-lg border bg-gray-50 p-3"
                              >
                                <p className="mb-2 text-sm font-semibold text-gray-900">
                                  {getVehiculeLabel(
                                    vehicule
                                  )}
                                </p>

                                <select
                                  className="w-full rounded border bg-white p-2 text-sm"
                                  value={
                                    conducteurId
                                  }
                                  onChange={(
                                    e
                                  ) =>
                                    handleConducteurChange(
                                      vehicule.id,
                                      e.target
                                        .value
                                    )
                                  }
                                >
                                  <option value="">
                                    Choisir le conducteur
                                  </option>

                                  {conducteursDuGroupe.map(
                                    (
                                      conducteur
                                    ) => (
                                      <option
                                        key={
                                          conducteur.id
                                        }
                                        value={
                                          conducteur.id
                                        }
                                      >
                                        {getUserLabel(
                                          conducteur
                                        )}
                                      </option>
                                    )
                                  )}
                                </select>

                                {conducteurId && (
                                  <p className="mt-2 text-xs font-medium text-green-700">
                                    Conducteur
                                    affecté :{" "}
                                    {getUserLabel(
                                      conducteursDuGroupe.find(
                                        (
                                          user
                                        ) =>
                                          user.id ===
                                          conducteurId
                                      ) ?? {}
                                    )}
                                  </p>
                                )}
                              </div>
                            );
                          }
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            }
          )}

          {/* Ajouter un groupe */}

          <div className="flex min-h-[600px] w-80 shrink-0 items-start justify-center rounded-lg border-2 border-dashed p-4">
            <button
              type="button"
              onClick={
                creerGroupeManuel
              }
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              + Ajouter un groupe
            </button>
          </div>
        </div>

        {/* Navigation */}

        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded border px-4 py-2 hover:bg-gray-100"
          >
            Précédent
          </button>

          <button
            type="button"
            onClick={handleContinuer}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Suivant
          </button>
        </div>
      </div>
    </MainLayout>
  );
}

export default CreerMission4Admin;