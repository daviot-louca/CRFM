import { Fuel } from "lucide-react";
import { formatDateTime, formatNumber } from "../utils/conducteur.utils";

function PleinsHistorique({ pleins }) {
  const pleinsTries = [...(pleins ?? [])].sort(
    (pleinA, pleinB) => new Date(pleinB.date) - new Date(pleinA.date),
  );

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-gray-950">
            Historique des pleins
          </h2>
          <p className="text-sm text-gray-600">{pleinsTries.length} enregistré</p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-bleu">
          <Fuel size={20} aria-hidden="true" />
        </div>
      </div>

      {pleinsTries.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm font-semibold text-gray-600">
          Aucun plein enregistré.
        </p>
      ) : (
        <div className="mt-4 divide-y divide-gray-100">
          {pleinsTries.map((plein) => (
            <div key={plein.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="font-bold text-gray-950">
                  {formatNumber(plein.litres, " L")}
                </p>
                <p className="mt-1 break-words text-sm text-gray-600">
                  {formatDateTime(plein.date)}
                </p>
              </div>
              <Fuel size={18} className="shrink-0 text-gray-400" aria-hidden="true" />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default PleinsHistorique;
