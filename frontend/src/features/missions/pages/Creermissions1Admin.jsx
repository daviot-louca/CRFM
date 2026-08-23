import MainLayout from "@/components/layout/MainLayout";
import { useNavigate } from "react-router-dom";
import { useMission } from "../context/useMission";

function Creermissions1Admin() {
  const navigate = useNavigate();
  const {
    informations: formData,
    setInformations: setFormData,
    resetMissionDraft,
  } = useMission();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      StatutMission: "En préparation",
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate("/admin/creer-missions-2");
  };

  const handleCancel = () => {
    resetMissionDraft();
    navigate("/admin/missions");
  };

  return (
    <MainLayout>
      <div className="mx-auto w-full max-w-7xl">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => navigate("/admin/missions")}
            className="mb-2 w-fit rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            ← Retour
          </button>
        </div>

        {/* Barre de progression */}
        <div className="mb-10 rounded-2xl border border-gray-200 bg-white px-6 py-6 shadow-sm">
          <div className="mx-auto flex max-w-3xl items-center justify-between">
            {/* Étape 1 */}
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center h-9 w-9 rounded-full border-2 border-blue-600 bg-blue-50 text-blue-700 font-bold">
                1
              </div>
              <span className="mt-2 text-xs font-semibold text-blue-700">Informations</span>
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

        {/* Formulaire */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
        >
          {/* Titre du formulaire */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900">Informations générales</h2>
            <p className="mt-1 text-sm text-gray-500">Renseignez les informations principales de la mission.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <label
                htmlFor="missionName"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Nom de la mission
              </label>
              <input
                id="missionName"
                name="missionName"
                type="text"
                value={formData.missionName ?? ""}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Ex. Exercice régimentaire"
              />
            </div>
            <div>
              <label
                htmlFor="debutMission"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Date de début
              </label>
              <input
                id="debutMission"
                name="debutMission"
                type="date"
                value={formData.debutMission ?? ""}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label
                htmlFor="finMission"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Date de fin
              </label>
              <input
                id="finMission"
                name="finMission"
                type="date"
                value={formData.finMission ?? ""}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div className="md:col-span-2">
              <label
                htmlFor="typeMission"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Type de mission
              </label>
              <input
                id="typeMission"
                name="typeMission"
                type="text"
                value={formData.typeMission ?? ""}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Ex. Exercice, projection, transport..."
              />
            </div>
            <div className="md:col-span-2">
              <label
                htmlFor="lieuMission"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Lieu / destination
              </label>
              <input
                id="lieuMission"
                name="lieuMission"
                type="text"
                value={formData.lieuMission ?? ""}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Ex. Camp de Mailly"
              />
            </div>
            <div className="md:col-span-2">
              <label
                htmlFor="missionDescription"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Description / consignes
              </label>
              <textarea
                id="missionDescription"
                name="missionDescription"
                value={formData.missionDescription ?? ""}
                onChange={handleChange}
                rows={5}
                className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Ajoutez les informations utiles concernant la mission..."
              />
            </div>
          </div>
          {/* Footer actions */}
          <div className="mt-8 flex flex-col-reverse items-stretch gap-4 border-t border-gray-100 pt-6 sm:flex-row sm:justify-between sm:items-center">
            <button
              type="button"
              className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              onClick={handleCancel}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Suivant →
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}

export default Creermissions1Admin;
