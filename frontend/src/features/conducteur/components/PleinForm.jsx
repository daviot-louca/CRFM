import { Check, Fuel, Plus } from "lucide-react";
import { useState } from "react";
import {
  getApiErrorMessage,
  parseNumberInput,
} from "../utils/conducteur.utils";

function PleinForm({ onAddPlein, saving }) {
  const [pleinEffectue, setPleinEffectue] = useState(false);
  const [litres, setLitres] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleToggle = () => {
    setPleinEffectue((currentValue) => !currentValue);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      const litresValue = parseNumberInput(
        litres,
        "La quantité de carburant",
        {
          required: true,
          strictlyPositive: true,
        },
      );

      await onAddPlein({
        litres: litresValue,
      });

      setLitres("");
      setSuccess("Plein ajouté.");
    } catch (addError) {
      setError(
        getApiErrorMessage(
          addError,
          "Impossible d'ajouter le plein.",
        ),
      );
    }
  };

  return (
    <section className="w-full min-w-0 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-bleu">
          <Fuel
            size={20}
            aria-hidden="true"
          />
        </div>

        <div className="min-w-0">
          <h2 className="text-base font-bold text-gray-950">
            Carburant
          </h2>

          <p className="text-sm text-gray-600">
            Pleins mission
          </p>
        </div>
      </div>

      {/* Bouton "J'ai fait le plein" */}
      <button
        type="button"
        onClick={handleToggle}
        className="mt-4 flex min-h-12 w-full items-center gap-3 rounded-lg border border-gray-300 bg-white px-3 text-left text-sm font-bold text-gray-800 transition hover:bg-gray-50 active:scale-[0.99]"
        aria-pressed={pleinEffectue}
      >
        <span
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${
            pleinEffectue
              ? "border-bleu bg-bleu text-white"
              : "border-gray-300 bg-white"
          }`}
        >
          {pleinEffectue && (
            <Check
              size={16}
              aria-hidden="true"
            />
          )}
        </span>

        <span className="min-w-0 wrap-break-word">
          J'ai fait le plein
        </span>
      </button>

      {/* Formulaire */}
      {pleinEffectue && (
        <form
          className="mt-4 space-y-4"
          onSubmit={handleSubmit}
        >
          {/* Quantité */}
          <label className="block text-sm font-semibold text-gray-800">
            Quantité de carburant

            <span className="mt-1 flex min-w-0 items-center rounded-lg border border-gray-300 bg-white px-3 transition focus-within:border-bleu focus-within:ring-2 focus-within:ring-blue-100">
              <input
                type="number"
                inputMode="decimal"
                min="0.01"
                step="0.01"
                value={litres}
                onChange={(event) => {
                  setLitres(event.target.value);
                  setError("");
                  setSuccess("");
                }}
                className="box-border min-h-12 min-w-0 w-full bg-transparent text-base font-semibold text-gray-950 outline-none"
              />

              <span className="shrink-0 pl-2 text-sm font-semibold text-gray-500">
                L
              </span>
            </span>
          </label>

          {/* Erreur */}
          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          )}

          {/* Succès */}
          {success && (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
              {success}
            </p>
          )}

          {/* Bouton */}
          <button
            type="submit"
            disabled={saving}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-gray-950 px-4 text-sm font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            <Plus
              size={18}
              aria-hidden="true"
            />

            {saving
              ? "Ajout..."
              : "Ajouter un plein"}
          </button>
        </form>
      )}
    </section>
  );
}

export default PleinForm;