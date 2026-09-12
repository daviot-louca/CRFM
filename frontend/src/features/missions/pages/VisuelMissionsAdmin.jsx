import { useState } from "react";
import { Link } from "react-router-dom";
import { useMissions } from "../hooks/useMissions";
import { deleteMission } from "../api/missions.api";
import MainLayout from "@/components/layout/MainLayout";
import { clearMissionCreationDraftStorage } from "../utils/missionDraftStorage";

function getStatutClasses(statut) {
  const s = (statut || "").toLowerCase();

  if (s.includes("termin")) {
    return "bg-green-100 text-green-700";
  }

  if (s.includes("cours")) {
    return "bg-blue-100 text-blue-700";
  }

  if (s.includes("planifi") || s.includes("prévu")) {
    return "bg-amber-100 text-amber-800";
  }

  if (s.includes("annul")) {
    return "bg-red-100 text-red-700";
  }

  return "bg-gray-100 text-gray-700";
}

function VisuelMissionsAdmin() {
  const {
    missions,
    loading,
    error,
    fetchMissions,
  } = useMissions();

  const [recherche, setRecherche] = useState("");
  const [statutFiltre, setStatutFiltre] =
    useState("Tous les statuts");

  const [missionASupprimer, setMissionASupprimer] =
    useState(null);

  const [suppressionEnCours, setSuppressionEnCours] =
    useState(false);

  const [erreurSuppression, setErreurSuppression] =
    useState("");

  const token = localStorage.getItem("token");

  let userRole = null;

  try {
    if (token) {
      const payload = JSON.parse(
        atob(token.split(".")[1])
      );

      userRole =
        payload?.role?.roleName ?? null;
    }
  } catch (error) {
    console.error(
      "Impossible de récupérer le rôle utilisateur :",
      error
    );
  }

  const isAdministrateur =
    userRole === "administrateur";

  const handleStartNewMission = () => {
    clearMissionCreationDraftStorage();
  };

  const statutsUniques = Array.from(
    new Set(
      missions
        ?.map((m) => m.StatutMission)
        .filter(Boolean)
    )
  );

  const missionsFiltrees = (missions || [])
    .filter((mission) => {
      const query =
        recherche.trim().toLowerCase();

      const matchRecherche =
        mission.missionName
          ?.toLowerCase()
          .includes(query) ||
        mission.lieuMission
          ?.toLowerCase()
          .includes(query) ||
        mission.typeMission
          ?.toLowerCase()
          .includes(query);

      const matchStatut =
        statutFiltre === "Tous les statuts" ||
        mission.StatutMission === statutFiltre;

      return (
        matchRecherche &&
        matchStatut
      );
    })
    .slice()
    .sort((a, b) => {
      const da = a.debutMission
        ? new Date(a.debutMission).getTime()
        : 0;

      const db = b.debutMission
        ? new Date(b.debutMission).getTime()
        : 0;

      return db - da;
    });

  const handleConfirmerSuppression =
    async () => {
      if (!missionASupprimer) {
        return;
      }

      setSuppressionEnCours(true);
      setErreurSuppression("");

      try {
        await deleteMission(
          missionASupprimer.id
        );

        setMissionASupprimer(null);

        if (
          typeof fetchMissions === "function"
        ) {
          await fetchMissions();
        }
      } catch (error) {
        setErreurSuppression(
          error?.response?.data?.message ||
            "Une erreur est survenue lors de la suppression de la mission."
        );
      } finally {
        setSuppressionEnCours(false);
      }
    };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex min-h-75 w-full items-center justify-center px-4">
          <p className="text-sm font-medium text-gray-500">
            Chargement des missions...
          </p>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex min-h-75 w-full items-center justify-center px-4">
          <p className="text-center text-sm font-medium text-red-600">
            Impossible de charger les missions.
          </p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="w-full min-w-0 pb-6">

        {/* Header */}
        {isAdministrateur && (
          <div className="mb-5 flex w-full justify-end sm:mb-8">
            <Link
              to="/admin/creer-missions-1"
              onClick={handleStartNewMission}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 active:scale-[0.98] sm:min-h-0 sm:w-auto sm:px-5 sm:py-2.5"
            >
              + Ajouter une mission
            </Link>
          </div>
        )}

        {/* Barre d'outils */}
        {missions.length > 0 && (
          <div className="mb-5 w-full min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:mb-6 sm:p-5">
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">

              {/* Recherche */}
              <div className="min-w-0 flex-1">
                <label
                  htmlFor="recherche-mission"
                  className="mb-1.5 block text-xs font-medium text-gray-600 sm:text-sm"
                >
                  Rechercher une mission
                </label>

                <div className="relative">
                  <input
                    id="recherche-mission"
                    type="search"
                    placeholder="Nom, lieu ou type..."
                    value={recherche}
                    onChange={(e) =>
                      setRecherche(e.target.value)
                    }
                    className="box-border block h-11 w-full min-w-0 max-w-full rounded-xl border border-gray-200 bg-white px-3 py-3 pr-10 text-base text-gray-900 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200 sm:h-10 sm:px-4 sm:text-sm"
                  />

                  {recherche && (
                    <button
                      type="button"
                      aria-label="Effacer la recherche"
                      onClick={() =>
                        setRecherche("")
                      }
                      className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Filtre statut */}
              <div className="w-full sm:w-56">
                <label
                  htmlFor="statut-mission"
                  className="mb-1.5 block text-xs font-medium text-gray-600 sm:text-sm"
                >
                  Statut
                </label>

                <select
                  id="statut-mission"
                  value={statutFiltre}
                  onChange={(e) =>
                    setStatutFiltre(e.target.value)
                  }
                  className="box-border block h-11 w-full min-w-0 max-w-full rounded-xl border border-gray-200 bg-white px-3 text-base text-gray-900 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200 sm:h-10 sm:px-4 sm:text-sm"
                >
                  <option value="Tous les statuts">
                    Tous les statuts
                  </option>

                  {statutsUniques.map((s) => (
                    <option
                      key={s}
                      value={s}
                    >
                      {s}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* Nombre de résultats */}
            <div className="mt-3 text-xs text-gray-500 sm:text-right sm:text-sm">
              {missionsFiltrees.length} mission
              {missionsFiltrees.length > 1
                ? "s"
                : ""}
            </div>
          </div>
        )}

        {/* État vide */}
        {missions.length === 0 ? (
          <div className="flex w-full flex-col items-center rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center sm:p-8">

            <p className="mb-2 text-lg font-semibold text-gray-900">
              Aucune mission
            </p>

            {isAdministrateur ? (
              <p className="mb-5 max-w-md text-sm leading-relaxed text-gray-500">
                Aucune mission n&apos;est actuellement
                enregistrée.
                <br />
                Créez votre première mission pour
                commencer à organiser vos actions.
              </p>
            ) : (
              <p className="mb-5 text-sm text-gray-500">
                Vous n'avez aucune mission pour le moment.
              </p>
            )}

            {isAdministrateur && (
              <Link
                to="/admin/creer-missions-1"
                onClick={handleStartNewMission}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 sm:min-h-0 sm:w-auto sm:py-2.5"
              >
                Créer la première mission
              </Link>
            )}
          </div>
        ) : missionsFiltrees.length === 0 ? (
          <div className="flex w-full flex-col items-center rounded-2xl border border-gray-200 bg-white p-6 text-center sm:p-8">

            <p className="mb-2 text-base font-semibold text-gray-900 sm:text-lg">
              Aucune mission ne correspond à votre recherche.
            </p>

            <button
              type="button"
              className="mt-3 min-h-11 w-full rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 sm:min-h-0 sm:w-auto sm:py-2"
              onClick={() => {
                setRecherche("");
                setStatutFiltre(
                  "Tous les statuts"
                );
              }}
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          /* Tableau */
          <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

            <div className="overflow-x-auto">
              <table className="w-full min-w-190 text-left">

                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 sm:px-5">
                      Mission
                    </th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 sm:px-5">
                      Type / Lieu
                    </th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 sm:px-5">
                      Période
                    </th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 sm:px-5">
                      Statut
                    </th>

                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 sm:px-5">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {missionsFiltrees.map(
                    (mission) => (
                      <tr
                        key={mission.id}
                        className="transition hover:bg-gray-50"
                      >

                        {/* Mission */}
                        <td className="px-4 py-4 sm:px-5">
                          <div className="max-w-60 font-semibold text-gray-900">
                            {mission.missionName ||
                              "Mission"}
                          </div>

                          {mission.missionDescription && (
                            <div className="mt-0.5 max-w-xs text-xs leading-relaxed text-gray-500 line-clamp-2">
                              {mission.missionDescription
                                .length > 100
                                ? mission.missionDescription.slice(
                                    0,
                                    100
                                  ) + "…"
                                : mission.missionDescription}
                            </div>
                          )}
                        </td>

                        {/* Type / lieu */}
                        <td className="px-4 py-4 text-sm text-gray-700 sm:px-5">
                          <div>
                            {mission.typeMission || (
                              <span className="text-gray-400">
                                —
                              </span>
                            )}
                          </div>

                          <div className="mt-0.5 text-xs text-gray-500">
                            {mission.lieuMission || (
                              <span className="text-gray-400">
                                —
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Période */}
                        <td className="px-4 py-4 text-sm text-gray-700 sm:px-5">
                          <div>
                            {mission.debutMission ? (
                              new Date(
                                mission.debutMission
                              ).toLocaleDateString(
                                "fr-FR"
                              )
                            ) : (
                              <span className="text-gray-400">
                                —
                              </span>
                            )}
                          </div>

                          <div className="mt-0.5 text-xs text-gray-500">
                            {mission.finMission ? (
                              new Date(
                                mission.finMission
                              ).toLocaleDateString(
                                "fr-FR"
                              )
                            ) : (
                              <span className="text-gray-400">
                                —
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Statut */}
                        <td className="px-4 py-4 text-sm sm:px-5">
                          <span
                            className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${getStatutClasses(
                              mission.StatutMission
                            )}`}
                          >
                            {mission.StatutMission ||
                              "—"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4 sm:px-5">
                          <div className="flex flex-col justify-end gap-2 sm:flex-row">

                            {/* Supprimer */}
                            <button
                              type="button"
                              className="min-h-10 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 active:scale-[0.98]"
                              onClick={() =>
                                setMissionASupprimer(
                                  mission
                                )
                              }
                            >
                              Supprimer
                            </button>

                            {/* Voir */}
                            <Link
                              to={`/admin/missions/${mission.id}`}
                              state={{
                                missionId:
                                  mission.id,
                              }}
                              className="inline-flex min-h-10 items-center justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 active:scale-[0.98]"
                            >
                              Voir la mission
                            </Link>

                          </div>
                        </td>

                      </tr>
                    )
                  )}
                </tbody>

              </table>
            </div>

            {/* Indication mobile */}
            <div className="border-t border-gray-100 bg-gray-50 px-4 py-2 text-center text-[11px] text-gray-400 sm:hidden">
              Faites glisser horizontalement pour voir
              toutes les informations.
            </div>

          </div>
        )}

        {/* Modale de confirmation suppression */}
        {missionASupprimer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">

            <div className="relative w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl sm:p-6">

              <button
                type="button"
                className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-lg text-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                onClick={() =>
                  setMissionASupprimer(null)
                }
                disabled={suppressionEnCours}
                aria-label="Fermer"
              >
                ×
              </button>

              <h2 className="mb-2 pr-8 text-lg font-bold text-gray-900">
                Supprimer la mission ?
              </h2>

              <div className="mb-3 wrap-break-words font-medium text-gray-900">
                {missionASupprimer.missionName}
              </div>

              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                Cette action est irréversible.
              </div>

              {erreurSuppression && (
                <div className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {erreurSuppression}
                </div>
              )}

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  className="min-h-11 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:opacity-50 sm:min-h-0 sm:w-auto"
                  onClick={() =>
                    setMissionASupprimer(null)
                  }
                  disabled={suppressionEnCours}
                >
                  Annuler
                </button>

                <button
                  type="button"
                  className="min-h-11 w-full rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-70 sm:min-h-0 sm:w-auto"
                  onClick={
                    handleConfirmerSuppression
                  }
                  disabled={suppressionEnCours}
                >
                  {suppressionEnCours
                    ? "Suppression..."
                    : "Supprimer"}
                </button>

              </div>

            </div>
          </div>
        )}

      </div>
    </MainLayout>
  );
}

export default VisuelMissionsAdmin;