import { RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { getConducteurVehicules } from "../api/conducteur.api";
import ConducteurMobileLayout from "../components/ConducteurMobileLayout";
import VehiculeMissionCard from "../components/VehiculeMissionCard";
import { getApiErrorMessage } from "../utils/conducteur.utils";

function ConducteurVehiculesPage() {
  const [vehicules, setVehicules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadVehicules = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getConducteurVehicules();
      setVehicules(Array.isArray(data) ? data : []);
    } catch (loadError) {
      setError(
        getApiErrorMessage(loadError, "Impossible de charger vos véhicules."),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadInitialVehicules = async () => {
      try {
        const data = await getConducteurVehicules();

        if (isActive) {
          setVehicules(Array.isArray(data) ? data : []);
        }
      } catch (loadError) {
        if (isActive) {
          setError(
            getApiErrorMessage(
              loadError,
              "Impossible de charger vos véhicules.",
            ),
          );
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadInitialVehicules();

    return () => {
      isActive = false;
    };
  }, []);

  const subtitle = loading
    ? "Chargement"
    : `${vehicules.length} véhicule${vehicules.length > 1 ? "s" : ""} affecté${
        vehicules.length > 1 ? "s" : ""
      }`;

  return (
    <ConducteurMobileLayout
      title="Mes missions"
      subtitle={subtitle}
      action={
        <button
          type="button"
          onClick={loadVehicules}
          disabled={loading}
          className="flex h-11 w-11 items-center justify-center rounded-lg border border-gray-200 bg-white text-bleu shadow-sm disabled:text-gray-400"
          aria-label="Actualiser"
          title="Actualiser"
        >
          <RefreshCw size={20} aria-hidden="true" />
        </button>
      }
    >
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-40 animate-pulse rounded-lg border border-gray-200 bg-white"
            />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && vehicules.length === 0 && (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center">
          <p className="font-bold text-gray-900">Aucun véhicule affecté.</p>
        </div>
      )}

      {!loading && !error && vehicules.length > 0 && (
        <div className="space-y-3">
          {vehicules.map((affectation) => (
            <VehiculeMissionCard
              key={affectation.missionVehiculeId}
              affectation={affectation}
            />
          ))}
        </div>
      )}
    </ConducteurMobileLayout>
  );
}

export default ConducteurVehiculesPage;
