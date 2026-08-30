import { useMissions2 } from '../hooks/useMissions2';
import Etapes2Compagnies from '../components/etape2/Etapes2Compagnies';
import Etapes2Sections from '../components/etape2/Etapes2Sections';
import Etapes2Personnel from '../components/etape2/Etapes2Personnel';
import Etapes2Groupes from '../components/etape2/Etapes2Groupes';
import {
  filtrerPersonnel,
  getNomComplet,
} from '../utils/personnel.utils';
import MainLayout from '@/components/layout/MainLayout';
import { useNavigate } from 'react-router-dom';
import { updateMissionGroupes } from '../api/missions.api';

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

      /*
       * On conserve le missionId pour que l'étape 3
       * recharge exactement la même mission.
       */

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
      <div className="min-h-screen bg-slate-50">

        <div className="max-w-[1900px] mx-auto px-8 py-6">

          {/* Timeline des étapes */}

          <div className="mb-10 rounded-2xl border border-gray-200 bg-white px-6 py-6 shadow-sm">

            <div className="mx-auto flex max-w-4xl items-center justify-between">

              {/* Étape 1 */}

              <div className="flex flex-col items-center">

                <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-gray-300 bg-gray-50 font-bold text-gray-400">
                  1
                </div>

                <span className="mt-2 text-xs font-semibold text-gray-400">
                  Informations
                </span>

              </div>

              {/* Trait */}

              <div className="mx-2 h-0.5 flex-1 bg-gray-200" />

              {/* Étape 2 */}

              <div className="flex flex-col items-center">

                <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-blue-600 bg-blue-50 font-bold text-blue-700">
                  2
                </div>

                <span className="mt-2 text-xs font-semibold text-blue-700">
                  Affectations
                </span>

              </div>

              {/* Trait */}

              <div className="mx-2 h-0.5 flex-1 bg-gray-200" />

              {/* Étape 3 */}

              <div className="flex flex-col items-center">

                <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-gray-300 bg-gray-50 font-bold text-gray-400">
                  3
                </div>

                <span className="mt-2 whitespace-nowrap text-xs font-semibold text-gray-400">
                  Commandement
                </span>

              </div>

              {/* Trait */}

              <div className="mx-2 h-0.5 flex-1 bg-gray-200" />

              {/* Étape 4 */}

              <div className="flex flex-col items-center">

                <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-gray-300 bg-gray-50 font-bold text-gray-400">
                  4
                </div>

                <span className="mt-2 text-xs font-semibold text-gray-400">
                  Véhicules
                </span>

              </div>

              {/* Trait */}

              <div className="mx-2 h-0.5 flex-1 bg-gray-200" />

              {/* Étape 5 */}

              <div className="flex flex-col items-center">

                <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-gray-300 bg-gray-50 font-bold text-gray-400">
                  5
                </div>

                <span className="mt-2 whitespace-nowrap text-xs font-semibold text-gray-400">
                  Conducteurs
                </span>

              </div>

            </div>

          </div>

          {/* Contenu */}

          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-lg">

            {/* Header */}

            <div className="px-10 pb-6 pt-8">

              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-block text-sm font-medium text-blue-600 hover:underline"
              >
                &larr; Retour
              </button>

            </div>

            {/* Main grid */}

            <div className="grid grid-cols-1 items-start gap-6 p-8 xl:grid-cols-16">

              <div className="xl:col-span-4">
                <Etapes2Compagnies
                  {...missions}
                />
              </div>

              <div className="xl:col-span-4">
                <Etapes2Sections
                  {...missions}
                />
              </div>

              <div className="xl:col-span-4">

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

              <div className="xl:col-span-4">

                <Etapes2Groupes
                  {...missions}
                  usersDisponibles={
                    missions.usersMission
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

            <div className="flex justify-between border-t border-slate-100 bg-slate-50 px-10 py-4 text-sm text-slate-600">

              <span>
                {
                  missions
                    .tousUsersSelectionnesIds
                    ?.length ?? 0
                }{" "}
                militaire(s)
                sélectionné(s)
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

            <div className="flex items-center justify-between border-t border-slate-200 bg-white px-10 py-6">

              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-lg border border-slate-300 bg-white px-6 py-2 font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Précédent
              </button>

              <button
                type="button"
                disabled={!peutContinuer}
                className={`rounded-xl px-8 py-3 font-semibold text-white transition ${peutContinuer
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "cursor-not-allowed bg-slate-300"
                  }`}
                onClick={
                  handleContinuer
                }
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