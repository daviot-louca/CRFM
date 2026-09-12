import MainLayout from "@/components/layout/MainLayout";
import { useNavigate } from "react-router-dom";
import { useMission } from "../context/useMission";
import { createMission } from "../api/missions.api";

function Creermissions1Admin() {
  const navigate = useNavigate();

  const {
    informations: formData,
    setInformations: setFormData,
    setMissionId,
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const missionData = {
        missionName: formData.missionName,
        missionDescription: formData.missionDescription ?? "",
        debutMission: formData.debutMission,
        finMission: formData.finMission,
        typeMission: formData.typeMission,
        lieuMission: formData.lieuMission,
        StatutMission: "En préparation",
      };

      console.log(
        "[ÉTAPE 1] Création de la mission :",
        missionData
      );

      const mission = await createMission(missionData);

      console.log(
        "[ÉTAPE 1] Mission créée :",
        mission
      );

      if (!mission?.id) {
        throw new Error(
          "La mission a été créée mais aucun ID n'a été retourné par le backend."
        );
      }

      setMissionId(mission.id);

      setFormData((current) => ({
        ...current,
        ...missionData,
      }));

      navigate("/admin/creer-missions-2");
    } catch (error) {
      console.error(
        "[ÉTAPE 1] Erreur lors de la création de la mission :",
        error
      );

      const message =
        error?.response?.data?.message ??
        error?.message ??
        "Impossible de créer la mission.";

      alert(message);
    }
  };

  const handleCancel = () => {
    resetMissionDraft();
    navigate("/admin/missions");
  };

  return (
    <MainLayout>
      <div className="mx-auto w-full min-w-0 max-w-7xl">
        {/* Retour */}
        <div className="mb-5 sm:mb-8">
          <button
            type="button"
            onClick={() => navigate("/admin/missions")}
            className="inline-flex min-h-10 items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 sm:text-sm"
          >
            ← Retour
          </button>
        </div>

        {/* Barre de progression */}
<div className="mb-5 w-full min-w-0 overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm sm:mb-8">
  <div className="flex min-w-[560px] items-start px-3 py-4 sm:mx-auto sm:min-w-0 sm:max-w-4xl sm:px-5 sm:py-5">
    {/* Étape 1 */}
    <div className="flex min-w-0 shrink-0 flex-1 flex-col items-center">
      <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-blue-600 bg-blue-50 text-xs font-bold text-blue-700 sm:h-8 sm:w-8 sm:text-sm">
        1
      </div>

      <span className="mt-1.5 max-w-[80px] text-center text-[9px] font-semibold leading-tight text-blue-700 sm:mt-2 sm:max-w-none sm:text-xs">
        Infos
      </span>
    </div>

    <div className="mt-3 h-0.5 min-w-4 flex-1 bg-gray-200 sm:mt-4 sm:min-w-6" />

    {/* Étape 2 */}
    <div className="flex min-w-0 shrink-0 flex-1 flex-col items-center">
      <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-gray-300 bg-gray-50 text-xs font-bold text-gray-400 sm:h-8 sm:w-8 sm:text-sm">
        2
      </div>

      <span className="mt-1.5 max-w-[95px] text-center text-[9px] font-semibold leading-tight text-gray-400 sm:mt-2 sm:max-w-none sm:text-xs">
        Affectations des compagnies
      </span>
    </div>

    <div className="mt-3 h-0.5 min-w-4 flex-1 bg-gray-200 sm:mt-4 sm:min-w-6" />

    {/* Étape 3 */}
    <div className="flex min-w-0 shrink-0 flex-1 flex-col items-center">
      <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-gray-300 bg-gray-50 text-xs font-bold text-gray-400 sm:h-8 sm:w-8 sm:text-sm">
        3
      </div>

      <span className="mt-1.5 max-w-[95px] text-center text-[9px] font-semibold leading-tight text-gray-400 sm:mt-2 sm:max-w-none sm:text-xs">
        Désignation du OAL et du SOA
      </span>
    </div>

    <div className="mt-3 h-0.5 min-w-4 flex-1 bg-gray-200 sm:mt-4 sm:min-w-6" />

    {/* Étape 4 */}
    <div className="flex min-w-0 shrink-0 flex-1 flex-col items-center">
      <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-gray-300 bg-gray-50 text-xs font-bold text-gray-400 sm:h-8 sm:w-8 sm:text-sm">
        4
      </div>

      <span className="mt-1.5 max-w-[80px] text-center text-[9px] font-semibold leading-tight text-gray-400 sm:mt-2 sm:max-w-none sm:text-xs">
        Véhicules
      </span>
    </div>

    <div className="mt-3 h-0.5 min-w-4 flex-1 bg-gray-200 sm:mt-4 sm:min-w-6" />

    {/* Étape 5 */}
    <div className="flex min-w-0 shrink-0 flex-1 flex-col items-center">
      <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-gray-300 bg-gray-50 text-xs font-bold text-gray-400 sm:h-8 sm:w-8 sm:text-sm">
        5
      </div>

      <span className="mt-1.5 max-w-[80px] text-center text-[9px] font-semibold leading-tight text-gray-400 sm:mt-2 sm:max-w-none sm:text-xs">
        Conducteurs
      </span>
    </div>
  </div>
</div>

        {/* Formulaire */}
        <form
          onSubmit={handleSubmit}
          className="w-full min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6 md:p-8"
        >
          <div className="mb-6 sm:mb-8">
            <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
              Informations générales
            </h2>

            <p className="mt-1 text-xs leading-relaxed text-gray-500 sm:text-sm">
              Renseignez les informations principales de la mission.
            </p>
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2">
            {/* Nom de la mission */}
            <div className="min-w-0 md:col-span-2">
              <label
                htmlFor="missionName"
                className="mb-2 block text-xs font-semibold text-gray-700 sm:text-sm"
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
                className="box-border block h-11 w-full min-w-0 max-w-full rounded-xl border border-gray-300 px-3 text-base text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:h-10 sm:px-4 sm:text-sm"
                placeholder="Ex. Exercice régimentaire"
              />
            </div>

            {/* Date de début */}
            <div className="min-w-0 w-full">
              <label
                htmlFor="debutMission"
                className="mb-2 block text-xs font-semibold text-gray-700 sm:text-sm"
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
                className="box-border block h-11 w-full min-w-0 max-w-full appearance-none rounded-xl border border-gray-300 bg-white px-3 text-base text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:h-10 sm:px-4 sm:text-sm"
              />
            </div>

            {/* Date de fin */}
            <div className="min-w-0 w-full">
              <label
                htmlFor="finMission"
                className="mb-2 block text-xs font-semibold text-gray-700 sm:text-sm"
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
                className="box-border block h-11 w-full min-w-0 max-w-full appearance-none rounded-xl border border-gray-300 bg-white px-3 text-base text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:h-10 sm:px-4 sm:text-sm"
              />
            </div>

            {/* Type de mission */}
            <div className="min-w-0 md:col-span-2">
              <label
                htmlFor="typeMission"
                className="mb-2 block text-xs font-semibold text-gray-700 sm:text-sm"
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
                className="box-border block h-11 w-full min-w-0 max-w-full rounded-xl border border-gray-300 px-3 text-base text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:h-10 sm:px-4 sm:text-sm"
                placeholder="Ex. Exercice, projection, transport..."
              />
            </div>

            {/* Lieu */}
            <div className="min-w-0 md:col-span-2">
              <label
                htmlFor="lieuMission"
                className="mb-2 block text-xs font-semibold text-gray-700 sm:text-sm"
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
                className="box-border block h-11 w-full min-w-0 max-w-full rounded-xl border border-gray-300 px-3 text-base text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:h-10 sm:px-4 sm:text-sm"
                placeholder="Ex. Camp de Mailly"
              />
            </div>

            {/* Description */}
            <div className="min-w-0 md:col-span-2">
              <label
                htmlFor="missionDescription"
                className="mb-2 block text-xs font-semibold text-gray-700 sm:text-sm"
              >
                Description / consignes
              </label>

              <textarea
                id="missionDescription"
                name="missionDescription"
                value={formData.missionDescription ?? ""}
                onChange={handleChange}
                rows={5}
                className="box-border block w-full min-w-0 max-w-full resize-none rounded-xl border border-gray-300 px-3 py-3 text-base text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:px-4 sm:text-sm"
                placeholder="Ajoutez les informations utiles concernant la mission..."
              />
            </div>
          </div>

          {/* Footer actions */}
          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:mt-8 sm:flex-row sm:items-center sm:justify-between sm:pt-6">
            <button
              type="button"
              onClick={handleCancel}
              className="min-h-11 w-full rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 sm:min-h-0 sm:w-auto"
            >
              Annuler
            </button>

            <button
              type="submit"
              className="min-h-11 w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 sm:min-h-0 sm:w-auto"
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