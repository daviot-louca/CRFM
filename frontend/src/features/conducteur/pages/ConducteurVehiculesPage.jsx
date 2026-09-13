import { RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { getConducteurVehicules } from "../api/conducteur.api";
import MainLayout from "../../../components/layout/MainLayout";
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
        getApiErrorMessage(
          loadError,
          "Impossible de charger vos véhicules.",
        ),
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
    : `${vehicules.length} véhicule${
        vehicules.length > 1 ? "s" : ""
      } affecté${
        vehicules.length > 1 ? "s" : ""
      }`;

  return (
    <MainLayout>
      <div className="min-h-screen w-full min-w-0 max-w-full">
        <div className="mx-auto w-full min-w-0 max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
                Mes missions
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                {subtitle}
              </p>
            </div>

            <button
              type="button"
              onClick={loadVehicules}
              disabled={loading}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-bleu shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400"
              aria-label="Actualiser"
              title="Actualiser"
            >
              <RefreshCw
                size={20}
                aria-hidden="true"
                className={
                  loading ? "animate-spin" : ""
                }
              />
            </button>
          </div>

          {loading && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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

          {!loading &&
            !error &&
            vehicules.length === 0 && (
              <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
                <p className="font-bold text-gray-900">
                  Aucun véhicule affecté.
                </p>
              </div>
            )}

          {!loading &&
            !error &&
            vehicules.length > 0 && (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {vehicules.map((affectation) => (
                  <VehiculeMissionCard
                    key={
                      affectation.missionVehiculeId
                    }
                    affectation={affectation}
                  />
                ))}
              </div>
            )}
        </div>
      </div>
    </MainLayout>
  );
}

export default ConducteurVehiculesPage;