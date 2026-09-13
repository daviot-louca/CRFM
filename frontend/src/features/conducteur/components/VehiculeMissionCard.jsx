import {
  ChevronRight,
  Gauge,
  MapPin,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  formatDate,
  getStatutClasses,
} from "../utils/conducteur.utils";

function VehiculeMissionCard({
  affectation,
}) {
  const mission = affectation?.mission;
  const statut =
    affectation?.statutReleve ??
    "À compléter";

  return (
    <Link
      to={`/conducteur/vehicules/${affectation.missionVehiculeId}`}
      className="group block w-full min-w-0 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:border-gray-300 hover:shadow-md active:scale-[0.99] sm:p-5"
      aria-label={`Ouvrir ${affectation.nom}`}
    >
      {/* En-tête */}
      <div className="flex min-w-0 items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="wrap-break-wordword text-sm font-semibold text-gray-600">
            {mission?.missionName ??
              "Mission"}
          </p>

          <h2 className="mt-2 wrap-break-word text-lg font-bold text-gray-950 sm:text-xl">
            {affectation.nom}
          </h2>

          <p className="mt-1 wrap-break-word text-sm font-medium text-gray-600">
            {affectation.immatriculation ??
              "Immatriculation non renseignée"}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-bleu text-white transition group-hover:translate-x-0.5">
          <ChevronRight
            size={22}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Informations principales */}
      <div className="mt-4 flex min-w-0 flex-wrap gap-2">
        <span
          className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${getStatutClasses(
            statut,
          )}`}
        >
          {statut}
        </span>

        <span className="inline-flex max-w-full min-w-0 items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-600">
          <Gauge
            size={14}
            className="shrink-0"
            aria-hidden="true"
          />

          <span className="wrap-break-word">
            {affectation.type ??
              "Type non renseigné"}
          </span>
        </span>
      </div>

      {/* Informations mission */}
      <div className="mt-4 grid grid-cols-1 gap-2 border-t border-gray-100 pt-3 text-sm text-gray-600 sm:grid-cols-2 sm:gap-4">
        {mission?.lieuMission && (
          <p className="flex min-w-0 gap-2">
            <MapPin
              size={16}
              className="mt-0.5 shrink-0"
              aria-hidden="true"
            />

            <span className="wrap-break-word">
              {mission.lieuMission}
            </span>
          </p>
        )}

        <p className="wrap-break-word sm:text-right">
          {formatDate(
            mission?.debutMission,
          )}{" "}
          -{" "}
          {formatDate(
            mission?.finMission,
          )}
        </p>
      </div>
    </Link>
  );
}

export default VehiculeMissionCard;