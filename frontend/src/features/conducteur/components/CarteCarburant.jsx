import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  getCartesCarburant,
  getCarteCarburantCode,
} from "../api/conducteur.api";

const CarteCarburant = () => {
  const [cartes, setCartes] = useState([]);
  const [typeSelectionne, setTypeSelectionne] = useState("");
  const [carteSelectionnee, setCarteSelectionnee] = useState("");
  const [code, setCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingCode, setLoadingCode] = useState(false);

  useEffect(() => {
    const chargerCartes = async () => {
      try {
        setLoading(true);

        const data = await getCartesCarburant();

        setCartes(data);
      } catch (error) {
        console.error(error);
        toast.error(
          "Impossible de récupérer les cartes carburant.",
        );
      } finally {
        setLoading(false);
      }
    };

    chargerCartes();
  }, []);

  const types = useMemo(() => {
    return [
      ...new Set(
        cartes.map((carte) => carte.type),
      ),
    ];
  }, [cartes]);

  const cartesDuType = useMemo(() => {
    return cartes.filter(
      (carte) =>
        carte.type === typeSelectionne,
    );
  }, [cartes, typeSelectionne]);

  const handleTypeChange = (event) => {
    const type = event.target.value;

    setTypeSelectionne(type);
    setCarteSelectionnee("");
    setCode(null);
  };

  const handleCarteChange = async (event) => {
    const carteId = event.target.value;

    setCarteSelectionnee(carteId);
    setCode(null);

    if (!carteId) {
      return;
    }

    try {
      setLoadingCode(true);

      const data =
        await getCarteCarburantCode(carteId);

      setCode(data.code);
    } catch (error) {
      console.error(error);

      toast.error(
        "Impossible de récupérer le code de la carte.",
      );
    } finally {
      setLoadingCode(false);
    }
  };

  if (loading) {
    return (
      <section className="w-full min-w-0 max-w-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <p className="text-sm text-gray-500">
          Chargement des cartes carburant...
        </p>
      </section>
    );
  }

  return (
    <section className="w-full min-w-0 max-w-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-900">
          Carte carburant
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Sélectionnez le type de carte puis son
          numéro pour afficher son code.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Type de carte */}
        <div className="w-full min-w-0">
          <label
            htmlFor="typeCarteCarburant"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Type de carte
          </label>

          <select
            id="typeCarteCarburant"
            value={typeSelectionne}
            onChange={handleTypeChange}
            className="box-border w-full min-w-0 max-w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-base text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-sm"
          >
            <option value="">
              Sélectionner un type
            </option>

            {types.map((type) => (
              <option
                key={type}
                value={type}
              >
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Numéro de carte */}
        {typeSelectionne && (
          <div className="w-full min-w-0">
            <label
              htmlFor="numeroCarteCarburant"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Numéro de carte
            </label>

            <select
              id="numeroCarteCarburant"
              value={carteSelectionnee}
              onChange={handleCarteChange}
              className="box-border w-full min-w-0 max-w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-base text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-sm"
            >
              <option value="">
                Sélectionner un numéro
              </option>

              {cartesDuType.map((carte) => (
                <option
                  key={carte.id}
                  value={carte.id}
                >
                  {carte.numero}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Code */}
        {carteSelectionnee && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 lg:col-span-2">
            <p className="text-sm font-medium text-gray-600">
              Code de la carte
            </p>

            {loadingCode ? (
              <p className="mt-2 text-sm text-gray-500">
                Récupération du code...
              </p>
            ) : (
              <p className="mt-2 text-2xl font-bold tracking-widest text-gray-900">
                {code ?? "—"}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default CarteCarburant;