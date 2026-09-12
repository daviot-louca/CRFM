import { useMissions2 } from "../hooks/useMissions2";
import Etapes2Compagnies from "../components/etape2/Etapes2Compagnies";
import Etapes2Sections from "../components/etape2/Etapes2Sections";
import Etapes2Personnel from "../components/etape2/Etapes2Personnel";
import Etapes2Groupes from "../components/etape2/Etapes2Groupes";
import {
  filtrerPersonnel,
  getNomComplet,
} from "../utils/personnel.utils";
import MainLayout from "@/components/layout/MainLayout";
import { useNavigate } from "react-router-dom";
import { updateMissionGroupes } from "../api/missions.api";

export default function CreerMissions2Admin() {
  const missions = useMissions2();
  const navigate = useNavigate();

  const peutContinuer =
    (missions.groupesManuels?.length ?? 0) > 0 &&
    Boolean(missions.missionId);

  const handleContinuer = async () => {
    if (!missions.missionId) {
      alert(
        "Aucune mission n'est actuellement sélectionnée."
      );
      return;
    }

    if (!peutContinuer) {
      return;
    }

    try {
      const groupesMission = (
        missions.groupesManuels ?? []
      ).map((groupe, index) => ({
        id: groupe.id,

        nom:
          groupe.nom ??
          groupe.nomGroupe ??
          `Groupe ${index + 1}`,

        ordre:
          groupe.ordre ??
          index + 1,

        compagnieId:
          groupe.compagnieId ??
          null,

        sectionId:
          groupe.sectionId ??
          null,

        soaId:
          groupe.soaId ??
          null,

        userIds:
          groupe.userIds ??
          groupe.users ??
          [],

        conducteurIds:
          groupe.conducteurIds ??
          [],
      }));

      console.log(
        "[ÉTAPE 2] Sauvegarde des groupes :",
        groupesMission
      );

      await updateMissionGroupes(
        missions.missionId,
        groupesMission
      );

      console.log(
        "[ÉTAPE 2] Groupes sauvegardés avec succès"
      );

      navigate(
        `/admin/creer-missions-3?missionId=${missions.missionId}`
      );
    } catch (error) {
      console.error(
        "[ÉTAPE 2] Erreur lors de la sauvegarde :",
        error
      );

      alert(
        error?.response?.data?.message ??
          error?.message ??
          "Impossible de sauvegarder l'étape 2."
      );
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen min-w-0 bg-slate-50">
        <div className="mx-auto w-full max-w-[1900px] px-3 py-4 sm:px-5 sm:py-6 lg:px-8">

          {/* ==================================================
              TIMELINE DES ÉTAPES
          ================================================== */}

          <div className="mb-5 w-full min-w-0 overflow-x-auto rounded-2xl border border-gray-200 bg-white px-3 py-4 shadow-sm sm:mb-7 sm:px-5 sm:py-5">
            <div className="mx-auto flex min-w-[560px] max-w-5xl items-start">

              {/* Étape 1 */}
              <div className="flex min-w-0 flex-1 flex-col items-center text-center">
                <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-green-400 bg-green-50 text-[10px] font-extrabold text-green-700 sm:h-8 sm:w-8 sm:text-xs">
                  ✓
                </div>

                <span className="mt-1.5 max-w-[80px] text-[9px] font-bold leading-tight text-green-700 sm:mt-2 sm:max-w-none sm:text-xs">
                  Infos
                </span>
              </div>

              <div className="mt-3 h-0.5 min-w-4 flex-1 bg-green-400 sm:mt-4 sm:min-w-6" />

              {/* Étape 2 */}
              <div className="flex min-w-0 flex-1 flex-col items-center text-center">
                <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-blue-600 bg-blue-50 text-[10px] font-extrabold text-blue-700 sm:h-8 sm:w-8 sm:text-xs">
                  2
                </div>

                <span className="mt-1.5 max-w-[100px] text-[9px] font-extrabold leading-tight text-blue-700 sm:mt-2 sm:max-w-none sm:text-xs">
                  Affectations des compagnies
                </span>
              </div>

              <div className="mt-3 h-0.5 min-w-4 flex-1 bg-gray-200 sm:mt-4 sm:min-w-6" />

              {/* Étape 3 */}
              <div className="flex min-w-0 flex-1 flex-col items-center text-center">
                <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-gray-300 bg-gray-50 text-[10px] font-bold text-gray-400 sm:h-8 sm:w-8 sm:text-xs">
                  3
                </div>

                <span className="mt-1.5 max-w-[105px] text-[9px] font-semibold leading-tight text-gray-400 sm:mt-2 sm:max-w-none sm:text-xs">
                  Désignation du OAL et du SOA
                </span>
              </div>

              <div className="mt-3 h-0.5 min-w-4 flex-1 bg-gray-200 sm:mt-4 sm:min-w-6" />

              {/* Étape 4 */}
              <div className="flex min-w-0 flex-1 flex-col items-center text-center">
                <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-gray-300 bg-gray-50 text-[10px] font-bold text-gray-400 sm:h-8 sm:w-8 sm:text-xs">
                  4
                </div>

                <span className="mt-1.5 max-w-[80px] text-[9px] font-semibold leading-tight text-gray-400 sm:mt-2 sm:max-w-none sm:text-xs">
                  Véhicules
                </span>
              </div>

              <div className="mt-3 h-0.5 min-w-4 flex-1 bg-gray-200 sm:mt-4 sm:min-w-6" />

              {/* Étape 5 */}
              <div className="flex min-w-0 flex-1 flex-col items-center text-center">
                <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-gray-300 bg-gray-50 text-[10px] font-bold text-gray-400 sm:h-8 sm:w-8 sm:text-xs">
                  5
                </div>

                <span className="mt-1.5 max-w-[80px] text-[9px] font-semibold leading-tight text-gray-400 sm:mt-2 sm:max-w-none sm:text-xs">
                  Conducteurs
                </span>
              </div>

            </div>
          </div>

          {/* ==================================================
              CONTENU
          ================================================== */}

          <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg sm:rounded-[28px]">

            {/* Header */}
            <div className="px-4 pb-5 pt-5 sm:px-8 sm:pb-6 sm:pt-7 lg:px-10">

              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex min-h-10 items-center text-sm font-medium text-blue-600 hover:underline"
              >
                &larr; Retour
              </button>

            </div>

            {/* Main grid */}
            <div className="grid min-w-0 grid-cols-1 items-start gap-4 p-4 sm:gap-5 sm:p-6 lg:gap-6 lg:p-8 xl:grid-cols-16">

              {/* Compagnies */}
              <div className="min-w-0 xl:col-span-4">
                <Etapes2Compagnies
                  {...missions}
                />
              </div>

              {/* Sections */}
              <div className="min-w-0 xl:col-span-4">
                <Etapes2Sections
                  {...missions}
                />
              </div>

              {/* Personnel */}
              <div className="min-w-0 xl:col-span-4">
                <Etapes2Personnel
                  {...missions}
                  filtrerPersonnel={
                    filtrerPersonnel
                  }
                  getNomComplet={
                    getNomComplet
                  }
                />
              </div>

              {/* Groupes */}
              <div className="min-w-0 xl:col-span-4">
                <Etapes2Groupes
                  {...missions}
                  usersDisponibles={
                    missions.usersDisponibles ??
                    missions.usersMission ??
                    []
                  }
                  getNomComplet={
                    getNomComplet
                  }
                  usersSelectionnesIds={
                    missions.tousUsersSelectionnesIds
                  }
                  sectionsSelectionnees={
                    missions.sectionsSelectionnees
                  }
                  getUsersSection={
                    missions.getUsersSection
                  }
                />
              </div>

            </div>

            {/* Summary bar */}
            <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50 px-4 py-4 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:text-sm lg:px-10">

              <span>
                {
                  missions
                    .tousUsersSelectionnesIds
                    ?.length ?? 0
                }{" "}
                militaire(s) sélectionné(s)
              </span>

              <span>
                {
                  missions
                    .groupesManuels
                    ?.length ?? 0
                }{" "}
                groupe(s)
              </span>

            </div>

            {/* Footer */}
            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-white px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10 lg:py-6">

              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-full rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:w-auto"
              >
                Précédent
              </button>

              <button
                type="button"
                disabled={!peutContinuer}
                className={`w-full rounded-xl px-8 py-3 text-sm font-semibold text-white transition sm:w-auto ${
                  peutContinuer
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "cursor-not-allowed bg-slate-300"
                }`}
                onClick={handleContinuer}
              >
                Suivant
              </button>

            </div>

          </div>
        </div>
      </div>
    </MainLayout>
  );
}