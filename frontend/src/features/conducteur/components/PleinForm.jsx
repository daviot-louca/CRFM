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
      const litresValue = parseNumberInput(litres, "La quantité de carburant", {
        required: true,
        strictlyPositive: true,
      });

      await onAddPlein({ litres: litresValue });
      setLitres("");
      setSuccess("Plein ajouté.");
    } catch (addError) {
      setError(getApiErrorMessage(addError, "Impossible d'ajouter le plein."));
    }
  };

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-bleu">
          <Fuel size={20} aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-950">Carburant</h2>
          <p className="text-sm text-gray-600">Pleins mission</p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleToggle}
        className="mt-4 flex min-h-12 w-full items-center gap-3 rounded-lg border border-gray-300 bg-white px-3 text-left text-sm font-bold text-gray-800 transition active:scale-[0.99]"
        aria-pressed={pleinEffectue}
      >
        <span
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${
            pleinEffectue ? "border-bleu bg-bleu text-white" : "border-gray-300"
          }`}
        >
          {pleinEffectue && <Check size={16} aria-hidden="true" />}
        </span>
        J'ai fait le plein
      </button>

      {pleinEffectue && (
        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-semibold text-gray-800">
            Quantité de carburant
            <span className="mt-1 flex items-center rounded-lg border border-gray-300 bg-white px-3 focus-within:border-bleu focus-within:ring-2 focus-within:ring-blue-100">
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
                className="min-h-12 w-full bg-transparent text-base font-semibold text-gray-950 outline-none"
              />
              <span className="shrink-0 text-sm font-semibold text-gray-500">
                L
              </span>
            </span>
          </label>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          )}

          {success && (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-gray-950 px-4 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            <Plus size={18} aria-hidden="true" />
            {saving ? "Ajout..." : "Ajouter un plein"}
          </button>
        </form>
      )}
    </section>
  );
}

export default PleinForm;
