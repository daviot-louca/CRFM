import MainLayout from "@/components/layout/MainLayout";
import { useNavigate } from "react-router-dom";
import { useMission } from "../context/useMission";
import { useCompagnies } from "../../compagnies/hooks/useCompagnies";
import { useVehicules } from "../../vehicules/hooks/useVehiculesdispo";
import { useState } from "react";
import { createMission } from "../api/missions.api";

function ValiderCreationMissions() {
  const navigate = useNavigate();

  const {
    informations: mission,
    groupesManuels: groupesMission,
    vehiculesSelectionnes,
    usersSelectionnes,
    compagniesSelectionneesIds,
    resetMissionDraft,
  } = useMission();

  const { compagnies, loading: compagniesLoading } = useCompagnies();
  const { vehicules, loading: vehiculesLoading } = useVehicules();

  const allSections = compagnies.flatMap(
    (compagnie) => compagnie.sections ?? []
  );

  const getSectionName = (sectionId) => {
    const section = allSections.find((s) => s.id === sectionId);

    if (!section) return sectionId ?? "Non définie";

    return (
      section.sectionName ??
      section.nom ??
      section.name ??
      sectionId
    );
  };

  const getCompagnieName = (compagnieId) => {
    const compagnie = compagnies.find(
      (c) => c.id === compagnieId
    );

    return compagnie?.nom ?? compagnieId ?? "Non définie";
  };

  const allUsers = allSections.flatMap(
    (section) => section.users ?? []
  );

  const getUserName = (userId) => {
    const user = allUsers.find(
      (u) => u.id === userId
    );

    if (!user) return userId;

    return [
      user.grade,
      user.lastName ?? user.nom,
      user.firstName ?? user.prenom,
    ]
      .filter(Boolean)
      .join(" ");
  };

  const oaResponsableMissionId =
    groupesMission
      .map((groupe) => {
        const compagnie = compagnies.find(
          (compagnie) =>
            compagnie.id === groupe.compagnieId
        );

        return compagnie?.oaId ?? null;
      })
      .find(Boolean) ?? null;

  const oaResponsableNom = oaResponsableMissionId
    ? getUserName(oaResponsableMissionId)
    : "Non défini";

  const vehiculesSelectionnesData = Array.isArray(
    vehiculesSelectionnes
  )
    ? vehiculesSelectionnes
    : [...vehiculesSelectionnes];

  const vehiculesSelectionnesIds =
    vehiculesSelectionnesData.map(
      (v) => v.vehiculeId
    );

  const vehiculesChoisis = vehicules.filter((vehicule) =>
    vehiculesSelectionnesIds.includes(vehicule.id)
  );

  /*
   * Structure :
   *
   * compagnie
   *   └── véhicules
   *         ├── vehiculeId
   *         └── conducteurId
   */
  const affectationsVehicules =
    compagniesSelectionneesIds.map((compagnieId) => ({
      compagnieId,

      vehicules: vehiculesSelectionnesData
        .filter(
          (v) => v.compagnieId === compagnieId
        )
        .map((v) => ({
          vehiculeId: v.vehiculeId,
          conducteurId: v.conducteurId ?? null,
        })),
    }));

  const nombreMilitaires = Object.values(
    usersSelectionnes
  ).reduce((total, users) => {
    if (users instanceof Set) {
      return total + users.size;
    }

    if (Array.isArray(users)) {
      return total + users.length;
    }

    return total;
  }, 0);

  const [creating, setCreating] = useState(false);
  const [creationError, setCreationError] =
    useState(null);

  const handleCreateMission = async () => {
    if (creating) return;

    if (
      !mission?.missionName ||
      !mission?.debutMission ||
      !mission?.finMission
    ) {
      setCreationError(
        "Les informations obligatoires de la mission sont incomplètes."
      );
      return;
    }

    if (groupesMission.length === 0) {
      setCreationError(
        "Ajoutez au moins un groupe avant de créer la mission."
      );
      return;
    }

    try {
      setCreating(true);
      setCreationError(null);

      console.log(
        "Groupes du contexte :",
        groupesMission
      );

      console.log(
        "Véhicules avec conducteurs :",
        affectationsVehicules
      );

      const payload = {
        missionName: mission.missionName,
        missionDescription:
          mission.missionDescription ?? "",
        debutMission: mission.debutMission,
        finMission: mission.finMission,
        typeMission: mission.typeMission ?? "",
        lieuMission: mission.lieuMission ?? "",
        StatutMission:
          mission.StatutMission ?? "En préparation",

        groupesMission: groupesMission.map(
          (groupe, index) => ({
            id: groupe.id,
            nom: groupe.nom,
            ordre: groupe.ordre ?? index + 1,
            compagnieId:
              groupe.compagnieId ?? null,
            sectionId:
              groupe.sectionId ?? null,
            soaId: groupe.soaId ?? null,

            conducteurIds: Array.isArray(
              groupe.conducteurIds
            )
              ? groupe.conducteurIds
              : [],

            userIds: Array.isArray(groupe.users)
              ? groupe.users
              : groupe.userIds ?? [],
          })
        ),

        affectationsVehicules,
      };

      console.log(
        "Payload envoyé :",
        JSON.stringify(payload, null, 2)
      );

      await createMission(payload);

      resetMissionDraft();

      navigate("/admin/missions");
    } catch (error) {
      console.error(
        "Erreur lors de la création de la mission :",
        error
      );

      setCreationError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Impossible de créer la mission."
      );
    } finally {
      setCreating(false);
    }
  };

  if (!mission) {
    return (
      <MainLayout>
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <p className="font-semibold text-red-700">
            Aucune mission à valider.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/admin/creer-missions-1")
            }
            className="mt-3 text-sm font-semibold text-red-700 underline"
          >
            Recommencer la création
          </button>
        </div>
      </MainLayout>
    );
  }

  if (compagniesLoading || vehiculesLoading) {
    return (
      <MainLayout>
        <p className="text-sm font-medium text-gray-500">
          Chargement du récapitulatif...
        </p>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Page Title Block */}

        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-500">
              Missions &gt; Nouvelle mission &gt; Validation
            </p>

            <h1 className="mt-1 text-3xl font-extrabold text-gray-900">
              Validation de la mission
            </h1>

            <p className="mt-2 text-gray-600">
              Vérifiez toutes les informations avant de
              créer la mission
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            ← Retour
          </button>
        </div>

        {/* Summary Cards */}

        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase text-gray-400">
              Nom de la mission
            </p>

            <p className="mt-2 font-bold text-gray-900">
              {mission.missionName}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase text-gray-400">
              Type de mission
            </p>

            <p className="mt-2 font-bold text-gray-900">
              {mission.typeMission || "—"}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase text-gray-400">
              Date et horaires
            </p>

            <p className="mt-2 font-bold text-gray-900">
              {new Date(
                mission.debutMission
              ).toLocaleDateString("fr-FR")}{" "}
              →{" "}
              {new Date(
                mission.finMission
              ).toLocaleDateString("fr-FR")}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase text-gray-400">
              OA responsable
            </p>

            <p className="mt-2 font-bold text-gray-900">
              {oaResponsableNom}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase text-gray-400">
              Statut
            </p>

            <p className="mt-2 font-bold text-gray-900">
              {mission.StatutMission}
            </p>
          </div>

        </div>

        {/* Détails de la mission */}

        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

          <h2 className="mb-6 text-lg font-bold text-gray-900">
            Détails de la mission
          </h2>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">

            <div>
              <p className="text-xs font-semibold uppercase text-gray-400">
                Nom
              </p>

              <p className="mt-1 font-semibold text-gray-900">
                {mission.missionName}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-gray-400">
                Type
              </p>

              <p className="mt-1 font-semibold text-gray-900">
                {mission.typeMission || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-gray-400">
                Lieu
              </p>

              <p className="mt-1 font-semibold text-gray-900">
                {mission.lieuMission || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-gray-400">
                Période
              </p>

              <p className="mt-1 font-semibold text-gray-900">
                {new Date(
                  mission.debutMission
                ).toLocaleDateString("fr-FR")}{" "}
                →{" "}
                {new Date(
                  mission.finMission
                ).toLocaleDateString("fr-FR")}
              </p>
            </div>

          </div>

          <div className="mt-6 border-t border-gray-200 pt-4">

            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Description / consignes
            </p>

            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-700">
              {mission.missionDescription ||
                "Aucune description renseignée."}
            </p>

          </div>

        </div>

        {/* Personnel sélectionné */}

        {groupesMission.length > 0 && (
          <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            <div className="mb-6 flex items-center justify-between">

              <h2 className="text-lg font-bold text-gray-900">
                Personnel sélectionné
              </h2>

              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                {nombreMilitaires}
              </span>

            </div>

            <div className="mb-6">

              <p className="text-xs font-semibold uppercase text-gray-400">
                OA responsable de la mission
              </p>

              <p className="mt-1 font-semibold text-gray-900">
                {oaResponsableNom}
              </p>

            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

              {groupesMission.map(
                (groupe, idx) => {
                  const groupeUsers =
                    Array.isArray(groupe.users) &&
                    groupe.users.length > 0
                      ? groupe.users
                      : Array.from(
                          usersSelectionnes[
                            groupe.id
                          ] ?? []
                        );

                  return (
                    <div
                      key={
                        groupe.id || idx
                      }
                      className="rounded-2xl border border-gray-300 bg-white p-6 shadow-sm"
                    >

                      <div className="mb-4 flex flex-wrap items-center gap-3">

                        <h3 className="text-xl font-bold text-blue-700">
                          {groupe.nom ||
                            "Groupe sans nom"}
                        </h3>

                        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                          {groupeUsers.length}{" "}
                          militaire
                          {groupeUsers.length >
                          1
                            ? "s"
                            : ""}
                        </span>

                        {groupe.type ===
                          "compagnie" && (
                          <span className="rounded-full bg-blue-200 px-3 py-1 text-xs font-semibold text-blue-800">
                            Compagnie entière
                          </span>
                        )}

                        {groupe.type ===
                          "section" && (
                          <span className="rounded-full bg-green-200 px-3 py-1 text-xs font-semibold text-green-800">
                            Section entière
                          </span>
                        )}

                        {groupe.type ===
                          "personnalise" && (
                          <span className="rounded-full bg-purple-200 px-3 py-1 text-xs font-semibold text-purple-800">
                            Personnalisé
                          </span>
                        )}

                        {groupe.automatique && (
                          <span className="rounded-full bg-yellow-200 px-3 py-1 text-xs font-semibold text-yellow-800">
                            Automatique
                          </span>
                        )}

                      </div>

                      <div className="mb-4 flex flex-wrap gap-2">

                        {groupeUsers.length >
                        0 ? (
                          groupeUsers.map(
                            (user) => (
                              <span
                                key={user}
                                className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 shadow-sm"
                              >
                                {getUserName(
                                  user
                                )}
                              </span>
                            )
                          )
                        ) : (
                          <p className="text-sm italic text-gray-400">
                            Aucun militaire
                            dans ce groupe
                          </p>
                        )}

                      </div>

                      <div className="mt-4 space-y-1 text-xs text-gray-600">

                        <p>
                          <span className="font-semibold">
                            SOA :
                          </span>{" "}
                          {groupe.soaId
                            ? getUserName(
                                groupe.soaId
                              )
                            : "Non défini"}
                        </p>

                        <p>
                          <span className="font-semibold">
                            Conducteurs :
                          </span>{" "}
                          {(
                            groupe.conducteurIds ??
                            []
                          ).length > 0
                            ? (
                                groupe.conducteurIds ??
                                []
                              )
                                .map(
                                  getUserName
                                )
                                .join(", ")
                            : "Aucun"}
                        </p>

                        <p>
                          <span className="font-semibold">
                            Compagnie :
                          </span>{" "}
                          {getCompagnieName(
                            groupe.compagnieId
                          )}
                        </p>

                        <p>
                          <span className="font-semibold">
                            Section :
                          </span>{" "}
                          {getSectionName(
                            groupe.sectionId
                          )}
                        </p>

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          </div>
        )}

        {/* Véhicules affectés */}

        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

          <div className="mb-6 flex items-center justify-between">

            <h2 className="text-lg font-bold text-gray-900">
              Véhicules affectés
            </h2>

            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
              {vehiculesSelectionnesData.length}{" "}
              véhicule
              {vehiculesSelectionnesData.length >
              1
                ? "s"
                : ""}
            </span>

          </div>

          <div className="flex flex-col gap-6">

            {affectationsVehicules.map(
              (affectation, index) => {

                const compagnie =
                  compagnies.find(
                    (item) =>
                      item.id ===
                      affectation.compagnieId
                  );

                return (
                  <div
                    key={`${affectation.compagnieId}-${index}`}
                    className="rounded-2xl border border-gray-300 bg-white p-6 shadow-sm"
                  >

                    <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-3">

                      <h3 className="text-lg font-bold text-gray-900">
                        {compagnie?.nom ||
                          "Compagnie inconnue"}
                      </h3>

                      <span className="text-sm text-gray-500">
                        {
                          affectation
                            .vehicules
                            .length
                        }{" "}
                        véhicule
                        {affectation
                          .vehicules
                          .length > 1
                          ? "s"
                          : ""}
                      </span>

                    </div>

                    <div className="flex flex-col gap-3">

                      {affectation.vehicules
                        .length > 0 ? (
                        affectation.vehicules.map(
                          (
                            affectationVehicule
                          ) => {

                            const vehicule =
                              vehicules.find(
                                (item) =>
                                  item.id ===
                                  affectationVehicule.vehiculeId
                              );

                            const conducteur =
                              affectationVehicule.conducteurId
                                ? allUsers.find(
                                    (user) =>
                                      user.id ===
                                      affectationVehicule.conducteurId
                                  )
                                : null;

                            return (
                              <div
                                key={
                                  affectationVehicule.vehiculeId
                                }
                                className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                              >

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                                  <div>

                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                      Véhicule
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-gray-900">
                                      {vehicule?.vehiculeName ||
                                        "Véhicule inconnu"}
                                    </p>

                                    <p className="mt-0.5 text-xs text-gray-500">
                                      {vehicule?.immatriculation ||
                                        "Immatriculation non renseignée"}
                                    </p>

                                  </div>

                                  <div>

                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                      Conducteur
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-gray-900">
                                      {conducteur
                                        ? getUserName(
                                            affectationVehicule.conducteurId
                                          )
                                        : "Aucun conducteur affecté"}
                                    </p>

                                  </div>

                                </div>

                              </div>
                            );
                          }
                        )
                      ) : (
                        <p className="text-sm italic text-gray-400">
                          Aucun véhicule
                          affecté.
                        </p>
                      )}

                    </div>

                  </div>
                );
              }
            )}

          </div>
        </div>

        {/* Erreur */}

        {creationError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-700">
              {creationError}
            </p>
          </div>
        )}

        {/* Footer */}

        <div className="mb-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-full rounded-lg border border-gray-300 bg-white px-8 py-3 text-center text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 sm:w-auto"
          >
            Retour aux étapes précédentes
          </button>

          <button
            type="button"
            onClick={handleCreateMission}
            disabled={creating}
            className="w-full rounded-lg bg-blue-600 px-8 py-3 text-center text-sm font-semibold text-white shadow-lg hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {creating
              ? "Création en cours..."
              : "Créer la mission"}
          </button>

        </div>

      </div>
    </MainLayout>
  );
}

export default ValiderCreationMissions;