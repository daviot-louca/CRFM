import { Gauge, Save } from "lucide-react";
import { useState } from "react";
import {
  getApiErrorMessage,
  getReleveLabels,
  parseNumberInput,
} from "../utils/conducteur.utils";

const initialForm = {
  modeReleve: "",
  valeurDepart: "",
  valeurArrivee: "",
};

const toInputValue = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "";
  }

  return String(value);
};

function ReleveForm({
  releve,
  onSave,
  saving,
}) {
  const [form, setForm] = useState(() => ({
    modeReleve:
      releve?.modeReleve ??
      initialForm.modeReleve,

    valeurDepart: toInputValue(
      releve?.valeurDepart,
    ),

    valeurArrivee: toInputValue(
      releve?.valeurArrivee,
    ),
  }));

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const labels = getReleveLabels(
    form.modeReleve,
  );

  const handleModeChange = (modeReleve) => {
    setForm((currentForm) => ({
      ...currentForm,
      modeReleve,
    }));

    setError("");
    setSuccess("");
  };

  const handleValueChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const validateForm = () => {
    if (!form.modeReleve) {
      throw new Error(
        "Choisissez un mode de relevé.",
      );
    }

    const valeurDepart =
      parseNumberInput(
        form.valeurDepart,
        "La valeur de départ",
      );

    const valeurArrivee =
      parseNumberInput(
        form.valeurArrivee,
        "La valeur d'arrivée",
      );

    if (
      valeurDepart !== null &&
      valeurArrivee !== null &&
      valeurArrivee < valeurDepart
    ) {
      throw new Error(
        "La valeur d'arrivée ne peut pas être inférieure à la valeur de départ.",
      );
    }

    return {
      modeReleve: form.modeReleve,
      valeurDepart,
      valeurArrivee,
    };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    try {
      await onSave(validateForm());

      setSuccess(
        "Relevé enregistré.",
      );
    } catch (saveError) {
      setError(
        getApiErrorMessage(
          saveError,
          "Impossible d'enregistrer.",
        ),
      );
    }
  };

  return (
    <section className="w-full min-w-0 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      {/* En-tête */}
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-bleu">
          <Gauge
            size={20}
            aria-hidden="true"
          />
        </div>

        <div className="min-w-0">
          <h2 className="text-base font-bold text-gray-950 sm:text-lg">
            Relevé
          </h2>

          <p className="mt-0.5 text-sm text-gray-600">
            {releve?.statut ??
              "À compléter"}
          </p>
        </div>
      </div>

      <form
        className="mt-4 space-y-4"
        onSubmit={handleSubmit}
      >
        {/* Mode de relevé */}
        <div>
          <label className="text-sm font-semibold text-gray-800">
            Mode de relevé
          </label>

          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {[
              [
                "kilometre",
                "Kilomètre",
              ],
              [
                "horametre",
                "Horamètre",
              ],
            ].map(
              ([mode, label]) => {
                const isSelected =
                  form.modeReleve ===
                  mode;

                return (
                  <button
                    key={mode}
                    type="button"
                    aria-pressed={
                      isSelected
                    }
                    onClick={() =>
                      handleModeChange(
                        mode,
                      )
                    }
                    className={`min-h-12 w-full rounded-lg border px-3 text-base font-bold transition sm:text-sm ${
                      isSelected
                        ? "border-bleu bg-bleu text-white"
                        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {label}
                  </button>
                );
              },
            )}
          </div>
        </div>

        {/* Valeurs */}
        {form.modeReleve && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Départ */}
            <label className="block min-w-0 text-sm font-semibold text-gray-800">
              {labels.depart}

              <span className="mt-1 flex min-w-0 items-center rounded-lg border border-gray-300 bg-white px-3 transition focus-within:border-bleu focus-within:ring-2 focus-within:ring-blue-100">
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  name="valeurDepart"
                  value={
                    form.valeurDepart
                  }
                  onChange={
                    handleValueChange
                  }
                  className="box-border min-h-12 min-w-0 w-full bg-transparent text-base font-semibold text-gray-950 outline-none"
                />

                <span className="shrink-0 pl-2 text-sm font-semibold text-gray-500">
                  {labels.unit}
                </span>
              </span>
            </label>

            {/* Arrivée */}
            <label className="block min-w-0 text-sm font-semibold text-gray-800">
              {labels.arrivee}

              <span className="mt-1 flex min-w-0 items-center rounded-lg border border-gray-300 bg-white px-3 transition focus-within:border-bleu focus-within:ring-2 focus-within:ring-blue-100">
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  name="valeurArrivee"
                  value={
                    form.valeurArrivee
                  }
                  onChange={
                    handleValueChange
                  }
                  className="box-border min-h-12 min-w-0 w-full bg-transparent text-base font-semibold text-gray-950 outline-none"
                />

                <span className="shrink-0 pl-2 text-sm font-semibold text-gray-500">
                  {labels.unit}
                </span>
              </span>
            </label>
          </div>
        )}

        {/* Erreur */}
        {error && (
          <p className="wrap-break-word rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
            {error}
          </p>
        )}

        {/* Succès */}
        {success && (
          <p className="wrap-break-wordword rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
            {success}
          </p>
        )}

        {/* Enregistrer */}
        <button
          type="submit"
          disabled={saving}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-bleu px-4 text-base font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-gray-400 sm:text-sm"
        >
          <Save
            size={18}
            aria-hidden="true"
          />

          {saving
            ? "Enregistrement..."
            : "Enregistrer le relevé"}
        </button>
      </form>
    </section>
  );
}

export default ReleveForm;