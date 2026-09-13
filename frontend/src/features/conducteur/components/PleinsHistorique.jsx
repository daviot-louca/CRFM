import { Fuel } from "lucide-react";
import {
  formatDateTime,
  formatNumber,
} from "../utils/conducteur.utils";

function PleinsHistorique({ pleins }) {
  const pleinsTries = [...(pleins ?? [])].sort(
    (pleinA, pleinB) =>
      new Date(pleinB.date) -
      new Date(pleinA.date),
  );

  return (
    <section className="w-full min-w-0 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      {/* En-tête */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="wrap-break-word text-base font-bold text-gray-950 sm:text-lg">
            Historique des pleins
          </h2>

          <p className="mt-1 text-sm text-gray-600">
            {pleinsTries.length} enregistré
            {pleinsTries.length > 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-bleu">
          <Fuel
            size={20}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Aucun plein */}
      {pleinsTries.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm font-semibold text-gray-600">
          Aucun plein enregistré.
        </p>
      ) : (
        /* Historique */
        <div className="mt-4 divide-y divide-gray-100">
          {pleinsTries.map((plein) => (
            <div
              key={plein.id}
              className="flex min-w-0 items-center justify-between gap-3 py-3 sm:px-1"
            >
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-950 sm:text-base">
                  {formatNumber(
                    plein.litres,
                    " L",
                  )}
                </p>

                <p className="mt-1 wrap-break-word text-xs text-gray-600 sm:text-sm">
                  {formatDateTime(plein.date)}
                </p>
              </div>

              <Fuel
                size={18}
                className="shrink-0 text-gray-400"
                aria-hidden="true"
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default PleinsHistorique;