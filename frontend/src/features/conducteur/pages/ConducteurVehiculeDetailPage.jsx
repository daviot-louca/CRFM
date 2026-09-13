import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  addConducteurPlein,
  getConducteurVehicule,
  saveConducteurReleve,
} from "../api/conducteur.api";

import MainLayout from "../../../components/layout/MainLayout";

import PleinForm from "../components/PleinForm";
import PleinsHistorique from "../components/PleinsHistorique";
import ReleveForm from "../components/ReleveForm";
import CarteCarburant from "../components/CarteCarburant";

import {
  formatDate,
  formatNumber,
  getApiErrorMessage,
  getReleveUnit,
  getStatutClasses,
} from "../utils/conducteur.utils";

const InfoRow = ({ label, value }) => (
  <div className="border-t py-3 first:border-t-0 first:pt-0 last:pb-0">
    <p className="text-xs font-semibold uppercase text-gray-500">
      {label}
    </p>

    <p className="mt-1 wrap-break-word text-sm font-bold text-gray-950">
      {value}
    </p>
  </div>
);

function ConducteurVehiculeDetailPage() {
  const { missionVehiculeId } = useParams();
  const navigate = useNavigate();

  const [vehicule, setVehicule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingReleve, setSavingReleve] = useState(false);
  const [savingPlein, setSavingPlein] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadInitialVehicule = async () => {
      try {
        const data = await getConducteurVehicule(
          missionVehiculeId,
        );

        if (isActive) {
          setVehicule(data);
        }
      } catch (loadError) {
        if (isActive) {
          setError(
            getApiErrorMessage(
              loadError,
              "Impossible de charger le véhicule.",
            ),
          );
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadInitialVehicule();

    return () => {
      isActive = false;
    };
  }, [missionVehiculeId]);

  const handleSaveReleve = async (payload) => {
    setSavingReleve(true);

    try {
      const updatedVehicule =
        await saveConducteurReleve(
          missionVehiculeId,
          payload,
        );

      setVehicule(updatedVehicule);

      return updatedVehicule;
    } finally {
      setSavingReleve(false);
    }
  };

  const handleAddPlein = async (payload) => {
    setSavingPlein(true);

    try {
      await addConducteurPlein(
        missionVehiculeId,
        payload,
      );

      const updatedVehicule =
        await getConducteurVehicule(
          missionVehiculeId,
        );

      setVehicule(updatedVehicule);
    } finally {
      setSavingPlein(false);
    }
  };

  const mission = vehicule?.mission;
  const releve = vehicule?.releve;
  const statut =
    vehicule?.statutReleve ?? "À compléter";

  const unit = getReleveUnit(
    releve?.modeReleve,
  );

  return (
    <MainLayout>
      <div className="min-h-screen w-full min-w-0 max-w-full">
        <div className="mx-auto w-full min-w-0 max-w-6xl px-4 py-6 sm:px-6 lg:px-8">

          {/* EN-TÊTE */}
          <div className="mb-6 flex items-center gap-4">
            <button
              type="button"
              onClick={() =>
                navigate("/conducteur/vehicules")
              }
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-bleu shadow-sm transition hover:bg-gray-50"
              aria-label="Retour"
              title="Retour"
            >
              <ArrowLeft
                size={20}
                aria-hidden="true"
              />
            </button>

            <div className="min-w-0">
              <h1 className="wrap-break-word text-xl font-bold text-gray-900 sm:text-2xl">
                {vehicule?.nom ?? "Véhicule"}
              </h1>

              <p className="mt-1 wrap-break-word text-sm text-gray-500">
                {mission?.missionName ??
                  "Détail mission"}
              </p>
            </div>
          </div>

          {/* CHARGEMENT */}
          {loading && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-36 animate-pulse rounded-lg border border-gray-200 bg-white"
                />
              ))}
            </div>
          )}

          {/* ERREUR */}
          {!loading && error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          {/* CONTENU */}
          {!loading &&
            !error &&
            vehicule && (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

                {/* INFORMATIONS VÉHICULE */}
                <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm lg:col-span-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-600">
                        {vehicule.type}
                      </p>

                      <h2 className="mt-1 wrap-break-word text-2xl font-bold text-gray-950">
                        {vehicule.nom}
                      </h2>

                      <p className="mt-2 wrap-break-word text-base font-semibold text-gray-700">
                        {vehicule.immatriculation}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-lg border px-2.5 py-1 text-xs font-bold ${getStatutClasses(
                        statut,
                      )}`}
                    >
                      {statut}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-x-4 border-t border-gray-100 pt-4">
                    <div>
                      <p className="text-xs font-semibold uppercase text-gray-500">
                        Départ
                      </p>

                      <p className="mt-1 text-sm font-bold text-gray-950">
                        {formatNumber(
                          releve?.valeurDepart,
                          unit,
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase text-gray-500">
                        Arrivée
                      </p>

                      <p className="mt-1 text-sm font-bold text-gray-950">
                        {formatNumber(
                          releve?.valeurArrivee,
                          unit,
                        )}
                      </p>
                    </div>
                  </div>
                </section>

                {/* AFFECTATION */}
                <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm lg:col-span-2">
                  <div className="mb-1 flex items-center gap-2 text-bleu">
                    <ShieldCheck
                      size={18}
                      aria-hidden="true"
                    />

                    <h2 className="text-base font-bold text-gray-950">
                      Affectation
                    </h2>
                  </div>

                  <InfoRow
                    label="Mission"
                    value={
                      mission?.missionName ??
                      "Mission"
                    }
                  />

                  <InfoRow
                    label="Groupe"
                    value={
                      vehicule.groupe?.nom ??
                      "Non renseigné"
                    }
                  />

                  <InfoRow
                    label="Compagnie"
                    value={
                      vehicule.compagnie?.nom ??
                      "Non renseignée"
                    }
                  />

                  <InfoRow
                    label="Section"
                    value={
                      vehicule.section
                        ?.sectionName ??
                      "Non renseignée"
                    }
                  />
                </section>

                {/* MISSION */}
                <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm lg:col-span-2">
                  <div className="mb-1 flex items-center gap-2 text-bleu">
                    <CalendarDays
                      size={18}
                      aria-hidden="true"
                    />

                    <h2 className="text-base font-bold text-gray-950">
                      Mission
                    </h2>
                  </div>

                  <InfoRow
                    label="Type"
                    value={
                      mission?.typeMission ??
                      "Non renseigné"
                    }
                  />

                  <InfoRow
                    label="Lieu"
                    value={
                      <span className="inline-flex items-start gap-2">
                        <MapPin
                          size={16}
                          className="mt-0.5 shrink-0"
                          aria-hidden="true"
                        />

                        {mission?.lieuMission ??
                          "Non renseigné"}
                      </span>
                    }
                  />

                  <InfoRow
                    label="Début"
                    value={formatDate(
                      mission?.debutMission,
                    )}
                  />

                  <InfoRow
                    label="Fin"
                    value={formatDate(
                      mission?.finMission,
                    )}
                  />
                </section>

                {/* CARTE CARBURANT */}
                <CarteCarburant />

                {/* RELEVÉ */}
                <ReleveForm
                  key={vehicule.missionVehiculeId}
                  releve={releve}
                  onSave={handleSaveReleve}
                  saving={savingReleve}
                />

                {/* AJOUT D'UN PLEIN */}
                <PleinForm
                  onAddPlein={handleAddPlein}
                  saving={savingPlein}
                />

                {/* HISTORIQUE DES PLEINS */}
                <PleinsHistorique
                  pleins={vehicule.pleins}
                />
              </div>
            )}
        </div>
      </div>
    </MainLayout>
  );
}

export default ConducteurVehiculeDetailPage;