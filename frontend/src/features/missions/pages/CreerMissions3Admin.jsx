import MainLayout from '@/components/layout/MainLayout'
import { useNavigate } from 'react-router-dom'
import Etapes3CompagnieVehicules from '../components/etape3/Etapes3CompagnieVehicules';
import { useMissions2 } from '../hooks/useMissions2';

function CreerMissions3Admin() {
  const navigate = useNavigate()
  const missions = useMissions2();
  console.log("Compagnies groupes :", missions.compagniesSelectionneesGroupes);
  console.log("Compagnies sélectionnées :", missions.compagniesSelectionnees);
  return (
    <MainLayout>
      <div className="h-[calc(100vh-2rem)] bg-slate-50 overflow-hidden">
        <div className="max-w-[1700px] h-full mx-auto px-8 py-4 flex flex-col min-h-0">
          {/* Command Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="text-slate-400 hover:text-slate-600 transition"
                aria-label="Retour"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <div>
                <h1 className="text-lg font-semibold text-slate-900">Affectation des véhicules</h1>
                <p className="text-sm text-slate-500">Étape 3 sur 4 · Sélection des véhicules par compagnie</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <div className="rounded-full bg-slate-200 text-slate-700 px-3 py-1 text-xs font-semibold select-none">
                {missions.compagniesSelectionneesGroupes?.length || 0} compagnies
              </div>
              <div className="rounded-full bg-slate-200 text-slate-700 px-3 py-1 text-xs font-semibold select-none">
                {missions.vehiculesSelectionnes?.length || 0} véhicules sélectionnés
              </div>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="mb-4 rounded-2xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
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
                <div className="flex items-center justify-center h-9 w-9 rounded-full border-2 border-gray-300 bg-gray-50 text-gray-400 font-bold">
                  2
                </div>
                <span className="mt-2 text-xs font-semibold text-gray-400">Affectations</span>
              </div>
              {/* Trait */}
              <div className="h-0.5 w-16 bg-gray-200 mx-2" />
              {/* Étape 3 (new) */}
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-9 w-9 rounded-full border-2 border-blue-600 bg-blue-50 text-blue-700 font-bold">
                  3
                </div>
                <span className="mt-2 text-xs font-semibold text-blue-700">Véhicules</span>
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
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="border border-slate-300 bg-white hover:bg-slate-50 rounded-2xl px-8 py-3 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1 transition-all duration-200"
                >
                  Précédent
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/admin/creer-missions-4')}
                  className="bg-blue-600 hover:bg-blue-700 rounded-2xl px-8 py-3 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1 transition-all duration-200"
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

export default CreerMissions3Admin