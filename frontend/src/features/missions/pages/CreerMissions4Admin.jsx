import MainLayout from '@/components/layout/MainLayout'
import { useNavigate } from 'react-router-dom'
import Etapes3CompagnieVehicules from '../components/etape4/Etapes4CompagnieVehicules';
import { useMissions2 } from '../hooks/useMissions2';
import { updateMissionVehicules } from '../api/missions.api';

function CreerMissions4Admin() {
  const navigate = useNavigate()
  const missions = useMissions2();

  const handleContinuer = async () => {
    if (!missions.missionId) {
      alert(
        "Aucune mission n'est actuellement sélectionnée."
      );
      return;
    }
  
    try {
      /*
       * Les véhicules peuvent actuellement contenir un groupe
       * temporaire du frontend :
       *
       * auto-section-xxxxxxxx
       *
       * Le backend attend obligatoirement le véritable
       * missions_groupes.id.
       */
  
      const groupesMission =
        missions.compagniesSelectionneesGroupes ?? [];
  
      const affectationsVehicules = (
        missions.vehiculesSelectionnes ?? []
      ).map((vehicule) => {
  
        /*
         * ID actuellement présent sur le véhicule.
         */
        const groupeIdActuel =
          vehicule.groupeId ??
          vehicule.missionGroupeId ??
          null;
  
        /*
         * Recherche du véritable groupe de mission.
         *
         * On accepte plusieurs noms possibles afin de rester
         * compatible avec les différentes structures retournées
         * par le contexte.
         */
        const groupeMission = groupesMission.find(
          (groupe) => {
  
            const vraisIds = [
              groupe?.missionGroupeId,
              groupe?.groupeId,
              groupe?.id,
            ].filter(Boolean);
  
            return vraisIds.includes(
              groupeIdActuel
            );
          }
        );
  
        /*
         * Si l'ID actuel est déjà un véritable UUID de groupe,
         * on le conserve.
         *
         * Si c'est un auto-section, on essaie de retrouver
         * le véritable ID du groupe.
         */
        let groupeIdFinal =
          groupeMission?.missionGroupeId ??
          groupeMission?.groupeId ??
          groupeMission?.id ??
          null;
  
        /*
         * Si aucun groupe n'a été trouvé mais que l'ID
         * ressemble à un véritable UUID, on le conserve.
         *
         * On refuse explicitement les auto-section.
         */
        if (
          !groupeIdFinal &&
          groupeIdActuel &&
          !String(groupeIdActuel).startsWith(
            "auto-section-"
          )
        ) {
          groupeIdFinal = groupeIdActuel;
        }
  
        if (!groupeIdFinal) {
          throw new Error(
            `Impossible de déterminer le groupe de mission du véhicule ${vehicule.vehiculeId}.`
          );
        }
  
        if (
          String(groupeIdFinal).startsWith(
            "auto-section-"
          )
        ) {
          throw new Error(
            `Le véhicule ${vehicule.vehiculeId} possède encore un groupe temporaire (${groupeIdFinal}).`
          );
        }
  
        return {
          vehiculeId:
            vehicule.vehiculeId,
  
          compagnieId:
            vehicule.compagnieId ?? null,
  
          groupeId:
            groupeIdFinal,
  
          sectionId:
            vehicule.sectionId ?? null,
        };
      });
  
      await updateMissionVehicules(
        missions.missionId,
        affectationsVehicules
      );
  
      navigate(
        `/admin/creer-missions-5?missionId=${missions.missionId}`
      );
  
    } catch (error) {
  
      alert(
        error?.response?.data?.message ??
        error?.message ??
        "Impossible de sauvegarder les véhicules."
      );
    }
  };
  return (
    <MainLayout>
      <div className="h-[calc(100vh-2rem)] bg-slate-50 overflow-hidden">
        <div className="max-w-[1700px] h-full mx-auto px-8 py-4 flex flex-col min-h-0">

          <div className="mb-5 w-full min-w-0 overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm sm:mb-8">
          <div className="flex min-w-155 items-start px-3 py-4 sm:mx-auto sm:min-w-0 sm:max-w-5xl sm:px-5 sm:py-5">

            {/* Étape 1 */}
            <div className="flex min-w-0 shrink-0 flex-1 flex-col items-center">
              <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-green-600 bg-green-50 text-xs font-bold text-green-700 sm:h-8 sm:w-8 sm:text-sm">
                ✓
              </div>

              <span className="mt-1.5 max-w-20 text-center text-[9px] font-semibold leading-tight text-green-700 sm:mt-2 sm:max-w-none sm:text-xs">
                Infos
              </span>
            </div>

            <div className="mt-3 h-0.5 min-w-4 flex-1 bg-green-300 sm:mt-4 sm:min-w-6" />

            {/* Étape 2 - ACTIVE */}
            <div className="flex min-w-0 shrink-0 flex-1 flex-col items-center">
              <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-green-600 bg-green-50 text-xs font-bold text-green-700 shadow-sm sm:h-8 sm:w-8 sm:text-sm">
              ✓
              </div>

              <span className="mt-1.5 max-w-24 text-center text-[9px] font-bold leading-tight textgreen-700 sm:mt-2 sm:max-w-none sm:text-xs">
                Affectations des compagnies
              </span>
            </div>

            <div className="mt-3 h-0.5 min-w-4 flex-1 bg-gray-200 sm:mt-4 sm:min-w-6" />

            {/* Étape 3 */}
            <div className="flex min-w-0 shrink-0 flex-1 flex-col items-center">
              <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-green-600 bg-green-50 text-xs font-bold text-green-700 sm:h-8 sm:w-8 sm:text-sm">
              ✓
              </div>

              <span className="mt-1.5 max-w-24 text-center text-[9px] font-semibold leading-tight textgreen-400 sm:mt-2 sm:max-w-none sm:text-xs">
                Désignation de l'OAL
              </span>
            </div>

            <div className="mt-3 h-0.5 min-w-4 flex-1 bg-gray-200 sm:mt-4 sm:min-w-6" />

            {/* Étape 4 */}
            <div className="flex min-w-0 shrink-0 flex-1 flex-col items-center">
              <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-blue-600 bg-blue-600 text-xs font-bold text-white sm:h-8 sm:w-8 sm:text-sm">
                4
              </div>

              <span className="mt-1.5 max-w-20 text-center text-[9px] font-semibold leading-tight text-blue-700 sm:mt-2 sm:max-w-none sm:text-xs">
                Véhicules
              </span>
            </div>

            <div className="mt-3 h-0.5 min-w-4 flex-1 bg-gray-200 sm:mt-4 sm:min-w-6" />

            {/* Étape 5 */}
            <div className="flex min-w-0 shrink-0 flex-1 flex-col items-center">
              <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-gray-300 bg-gray-50 text-xs font-bold text-gray-400 sm:h-8 sm:w-8 sm:text-sm">
                5
              </div>

              <span className="mt-1.5 max-w-24 text-center text-[9px] font-semibold leading-tight text-gray-400 sm:mt-2 sm:max-w-none sm:text-xs">
                Désignation du ou des SOA
              </span>
            </div>

            <div className="mt-3 h-0.5 min-w-4 flex-1 bg-gray-200 sm:mt-4 sm:min-w-6" />

            {/* Étape 6 */}
            <div className="flex min-w-0 shrink-0 flex-1 flex-col items-center">
              <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-gray-300 bg-gray-50 text-xs font-bold text-gray-400 sm:h-8 sm:w-8 sm:text-sm">
                6
              </div>

              <span className="mt-1.5 max-w-20 text-center text-[9px] font-semibold leading-tight text-gray-400 sm:mt-2 sm:max-w-none sm:text-xs">
                Conducteurs
              </span>
            </div>

          </div>
          </div>

          <div className="flex-1 min-h-0 rounded-[28px] shadow-lg border border-slate-200 bg-white flex flex-col overflow-hidden">

            {/* Header */}
            <div className="flex items-center space-x-4 px-6 py-3 border-b border-slate-200 bg-white">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-1">
                  Affectation des véhicules par compagnie
                </h2>
              </div>
            </div>

            {/* Main content */}
                  <div className="h-full overflow-y-auto pr-2 space-y-4 scroll-smooth overscroll-contain">
                    {missions.compagniesSelectionneesGroupes?.map((compagnie) => (
                      <Etapes3CompagnieVehicules
                        key={compagnie.compagnieId}
                        compagnie={compagnie}
                        vehicules={missions.vehiculesFiltres}
                        vehiculesSelectionnes={missions.vehiculesSelectionnes}
                        toggleVehicule={missions.toggleVehicule}
                      />
                    ))}
                  </div>

            {/* Footer */}
            <footer className="px-8 py-4 border-t border-slate-200 bg-white">
            <div className="flex w-full items-center gap-2 sm:justify-between sm:gap-4">
  <button
    type="button"
    onClick={() => navigate(-1)}
    className="min-w-0 flex-1 rounded-2xl border border-slate-300 bg-white px-3 py-3 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1 active:scale-[0.98] sm:flex-none sm:px-8"
  >
    Précédent
  </button>

  <button
    type="button"
    onClick={handleContinuer}
    className="min-w-0 flex-1 rounded-2xl bg-blue-600 px-3 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1 active:scale-[0.98] sm:flex-none sm:px-8"
  >
    Suivant
  </button>
</div>
            </footer>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default CreerMissions4Admin