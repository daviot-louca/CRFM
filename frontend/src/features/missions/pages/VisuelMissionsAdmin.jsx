import { useState } from "react";
import { Link } from "react-router-dom";
import { useMissions } from "../hooks/useMissions";
import { deleteMission } from "../api/missions.api";
import MainLayout from "@/components/layout/MainLayout";
import { clearMissionCreationDraftStorage } from "../utils/missionDraftStorage";

function getStatutClasses(statut) {
  const s = (statut || "").toLowerCase();
  if (s.includes("termin")) return "bg-green-100 text-green-700";
  if (s.includes("cours")) return "bg-blue-100 text-blue-700";
  if (s.includes("planifi") || s.includes("prévu")) return "bg-amber-100 text-amber-800";
  if (s.includes("annul")) return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-700";
}

function VisuelMissionsAdmin() {
  const { missions, loading, error, fetchMissions } = useMissions();
  // Etats pour recherche, filtre, modale suppression
  const [recherche, setRecherche] = useState("");
  const [statutFiltre, setStatutFiltre] = useState("Tous les statuts");
  const [missionASupprimer, setMissionASupprimer] = useState(null);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);
  const [erreurSuppression, setErreurSuppression] = useState("");

  const handleStartNewMission = () => {
    clearMissionCreationDraftStorage();
  };

  // Extraction des statuts uniques présents dans les missions
  const statutsUniques = Array.from(
    new Set(missions?.map((m) => m.StatutMission).filter(Boolean))
  );

  // Filtrage et tri
  const missionsFiltrees = (missions || [])
    .filter((mission) => {
      const query = recherche.toLowerCase();
      const matchRecherche =
        mission.missionName?.toLowerCase().includes(query) ||
        mission.lieuMission?.toLowerCase().includes(query) ||
        mission.typeMission?.toLowerCase().includes(query);
      const matchStatut =
        statutFiltre === "Tous les statuts" || mission.StatutMission === statutFiltre;
      return matchRecherche && matchStatut;
    })
    .slice() // pour ne pas muter
    .sort((a, b) => {
      const da = a.debutMission ? new Date(a.debutMission).getTime() : 0;
      const db = b.debutMission ? new Date(b.debutMission).getTime() : 0;
      return db - da;
    });

  // Handler pour la suppression
  const handleConfirmerSuppression = async () => {
    if (!missionASupprimer) return;

    setSuppressionEnCours(true);
    setErreurSuppression("");

    try {
      await deleteMission(missionASupprimer.id);
      setMissionASupprimer(null);

      if (typeof fetchMissions === "function") {
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

  // Etats loading/error gardent MainLayout
  if (loading) {
    return (
      <MainLayout>
        <div className="w-full flex items-center justify-center min-h-[300px]">
          <p className="text-sm font-medium text-gray-500">Chargement des missions...</p>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="w-full flex items-center justify-center min-h-[300px]">
          <p className="text-sm font-medium text-red-600">Impossible de charger les missions.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center items-end justify-end mb-8 gap-4">
          <Link
            to="/admin/creer-missions-1"
            onClick={handleStartNewMission}
            className="inline-block rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 active:scale-[0.98]"
          >
            + Ajouter une mission
          </Link>
        </div>

        {/* Barre d'outils */}
        {missions.length > 0 && (
          <div className="mb-6 rounded-xl bg-white p-4 shadow flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-1 gap-2">
              <input
                type="text"
                placeholder="Rechercher une mission..."
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                className="w-full md:w-64 rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
              />
              <select
                className="rounded-md border border-gray-200 px-3 py-2 text-sm bg-white text-gray-900"
                value={statutFiltre}
                onChange={(e) => setStatutFiltre(e.target.value)}
              >
                <option value="Tous les statuts">Tous les statuts</option>
                {statutsUniques.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-sm text-gray-500 text-right mt-2 md:mt-0">
              {missionsFiltrees.length} mission{missionsFiltrees.length > 1 ? "s" : ""}
            </div>
          </div>
        )}

        {/* Tableau ou état vide */}
        {missions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center flex flex-col items-center">
            <p className="font-semibold text-gray-900 text-lg mb-2">Aucune mission</p>
            <p className="mb-4 text-sm text-gray-500">
              Aucune mission n&apos;est actuellement enregistrée.<br />
              Créez votre première mission pour commencer à organiser vos actions.
            </p>
            <Link
              to="/admin/creer-missions-1"
              onClick={handleStartNewMission}
              className="inline-block rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800"
            >
              Créer la première mission
            </Link>
          </div>
        ) : missionsFiltrees.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center flex flex-col items-center">
            <p className="font-semibold text-gray-900 text-lg mb-2">
              Aucune mission ne correspond à votre recherche.
            </p>
            <button
              className="mt-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800"
              onClick={() => {
                setRecherche("");
                setStatutFiltre("Tous les statuts");
              }}
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Mission</th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Type / Lieu</th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Période</th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Statut</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {missionsFiltrees.map((mission) => (
                    <tr key={mission.id} className="transition hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-gray-900">{mission.missionName || "Mission"}</div>
                        {mission.missionDescription && (
                          <div className="text-xs text-gray-500 mt-0.5 line-clamp-2 max-w-xs">
                            {mission.missionDescription.length > 100
                              ? mission.missionDescription.slice(0, 100) + "…"
                              : mission.missionDescription}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700">
                        <div>{mission.typeMission || <span className="text-gray-400">—</span>}</div>
                        <div className="text-xs text-gray-500">{mission.lieuMission || <span className="text-gray-400">—</span>}</div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700">
                        <div>
                          {mission.debutMission
                            ? new Date(mission.debutMission).toLocaleDateString("fr-FR")
                            : <span className="text-gray-400">—</span>}
                        </div>
                        <div className="text-xs text-gray-500">
                          {mission.finMission
                            ? new Date(mission.finMission).toLocaleDateString("fr-FR")
                            : <span className="text-gray-400">—</span>}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm">
                        <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getStatutClasses(mission.StatutMission)}`}>
                          {mission.StatutMission || "—"}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex flex-row gap-2 justify-end">
                          {/* Modifier */}
                          {/* Si une route d'édition existe, remplacer /admin/missions/edit/${mission.id} par la vraie route */}
                          {/* TODO: Connecter la route de modification si elle existe */}
                          {/* La route d'édition existe sous /admin/missions/edit/:id */}
                          <Link
                            to={`/admin/missions/edit/${mission.id}`}
                            state={{ mission }}
                            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                          >
                            Modifier
                          </Link>
                          {/* Supprimer */}
                          <button
                            type="button"
                            className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                            onClick={() => setMissionASupprimer(mission)}
                          >
                            Supprimer
                          </button>
                          {/* Voir */}
                          <Link
                            to={`/admin/missions/${mission.id}`}
                            state={{ missionId: mission.id }}
                            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
                          >
                            Voir la mission
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modale de confirmation suppression */}
        {missionASupprimer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6 relative">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                onClick={() => setMissionASupprimer(null)}
                disabled={suppressionEnCours}
                aria-label="Fermer"
              >
                ×
              </button>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Supprimer la mission&nbsp;?</h2>
              <div className="mb-3 text-gray-900 font-medium">{missionASupprimer.missionName}</div>
              <div className="mb-4 text-sm text-red-600">
                Cette action est irréversible.
              </div>
              {erreurSuppression && (
                <div className="mb-3 text-sm text-red-600">{erreurSuppression}</div>
              )}
              <div className="flex justify-end gap-2">
                <button
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                  onClick={() => setMissionASupprimer(null)}
                  disabled={suppressionEnCours}
                >
                  Annuler
                </button>
                <button
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-70"
                  onClick={handleConfirmerSuppression}
                  disabled={suppressionEnCours}
                >
                  {suppressionEnCours ? "Suppression..." : "Supprimer"}
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
