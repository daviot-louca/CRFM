import { useMissions2 } from '../hooks/useMissions2';
import Etapes2Compagnies from '../components/etape2/Etapes2Compagnies';
import Etapes2Sections from '../components/etape2/Etapes2Sections';
import Etapes2Personnel from '../components/etape2/Etapes2Personnel';
import Etapes2Groupes from '../components/etape2/Etapes2Groupes';
import { filtrerPersonnel, getNomComplet } from '../utils/personnel.utils';
import MainLayout from '@/components/layout/MainLayout';
import { useNavigate } from 'react-router-dom';

export default function CreerMissions2Admin() {
  const missions = useMissions2();
  const navigate = useNavigate();
  const peutContinuer = (missions.groupesManuels?.length ?? 0) > 0;
  return (
    <MainLayout>
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-[1900px] mx-auto px-8 py-6">
          <div className="mb-10 rounded-2xl border border-gray-200 bg-white px-6 py-6 shadow-sm">
            <div className="mx-auto flex max-w-3xl items-center justify-between">
              {/* Étape 1 */}
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-9 w-9 rounded-full border-2 border-gray-300 bg-gray-50 text-gray-400 font-bold">
                  1
                </div>
                <span className="mt-2 text-xs font-semibold text-gray-400">Informations</span>
              </div>
              {/* Trait */}
              <div className="h-0.5 w-16 bg-gray-200 mx-2" />
              {/* Étape 2 */}
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-9 w-9 rounded-full border-2 border-blue-600 bg-blue-50 text-blue-700 font-bold">
                  2
                </div>
                <span className="mt-2 text-xs font-semibold text-blue-700">Affectations</span>
              </div>
              {/* Trait */}
              <div className="h-0.5 w-16 bg-gray-200 mx-2" />
              {/* Étape 3 (new) */}
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-9 w-9 rounded-full border-2 border-gray-300 bg-gray-50 text-gray-400 font-bold">
                  3
                </div>
                <span className="mt-2 text-xs font-semibold text-gray-400">Véhicules</span>
              </div>
              {/* Trait */}
              <div className="h-0.5 w-16 bg-gray-200 mx-2" />
              {/* Étape 4 */}
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-9 w-9 rounded-full border-2 border-gray-300 bg-gray-50 text-gray-400 font-bold">
                  4
                </div>
                <span className="mt-2 text-xs font-semibold text-gray-400 whitespace-nowrap">Récapitulatif &amp; validation</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-[28px] shadow-lg border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="px-10 pt-8 pb-6">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-block text-blue-600 text-sm font-medium hover:underline"
              >
                &larr; Retour
              </button>
            </div>
            {/* Main grid */}
            <div className="p-8 grid grid-cols-1 xl:grid-cols-16 gap-6 items-start">
              <div className="xl:col-span-4">
                <Etapes2Compagnies {...missions} />
              </div>

              <div className="xl:col-span-4">
                <Etapes2Sections {...missions} />
              </div>

              <div className="xl:col-span-4">
                <Etapes2Personnel
                  {...missions}
                  filtrerPersonnel={filtrerPersonnel}
                  getNomComplet={getNomComplet}
                />
              </div>

              <div className="xl:col-span-4">
                <Etapes2Groupes
                  {...missions}
                  getNomComplet={getNomComplet}
                  usersSelectionnesIds={missions.tousUsersSelectionnesIds}
                  sectionsSelectionnees={missions.sectionsSelectionnees}
                  getUsersSection={missions.getUsersSection}
                />
              </div>
            </div>
            {/* Summary bar */}
            <div className="px-10 py-4 border-t border-slate-100 flex justify-between text-sm text-slate-600 bg-slate-50">
              <span>{missions.tousUsersSelectionnesIds?.length ?? 0} militaire(s) sélectionné(s)</span>
              <span>{missions.groupesManuels?.length ?? 0} groupe(s)</span>
            </div>
            {/* Footer */}
            <div className="px-10 py-6 border-t border-slate-200 flex justify-between items-center bg-white">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-50 transition"
              >
                Précédent
              </button>
              <button
                type="button"
                disabled={!peutContinuer}
                className={`px-8 py-3 rounded-xl text-white font-semibold transition ${peutContinuer
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-slate-300 cursor-not-allowed'
                  }`}
                onClick={() => navigate('/admin/creer-missions-3')}
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
