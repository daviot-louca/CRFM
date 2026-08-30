export default function Etapes3Resume({ vehiculesSelectionnes, usersSelectionnesIds = [], groupesManuels = [] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-full flex flex-col">
      <header className="mb-6">
        <h2 className="text-xs font-semibold uppercase text-slate-400">RÉSUMÉ</h2>
        <p className="text-sm text-slate-600">Vue d&apos;ensemble de la mission.</p>
      </header>

      <section className="flex flex-col space-y-4 mb-6">
        <div className="flex items-center space-x-4 rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 text-lg">👥</div>
          <div>
            <p className="text-sm text-slate-500">Militaires</p>
            <p className="text-2xl font-semibold text-slate-900">{usersSelectionnesIds.length}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4 rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-600 text-lg">🛡️</div>
          <div>
            <p className="text-sm text-slate-500">Groupes</p>
            <p className="text-2xl font-semibold text-slate-900">{groupesManuels.length}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4 rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 text-orange-600 text-lg">🚚</div>
          <div>
            <p className="text-sm text-slate-500">Véhicules</p>
            <p className="text-2xl font-semibold text-slate-900">{vehiculesSelectionnes.length}</p>
          </div>
        </div>
      </section>

      <div className="mt-auto rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-slate-600">
        <h3 className="font-semibold mb-1">Rappel</h3>
        <p>Vérifiez que chaque groupe dispose des véhicules nécessaires avant de passer au récapitulatif.</p>
      </div>
    </div>
  );
}
