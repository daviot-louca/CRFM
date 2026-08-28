import { ChevronRight, Gauge, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDate, getStatutClasses } from "../utils/conducteur.utils";

function VehiculeMissionCard({ affectation }) {
  const mission = affectation?.mission;
  const statut = affectation?.statutReleve ?? "À compléter";

  return (
    <Link
      to={`/conducteur/vehicules/${affectation.missionVehiculeId}`}
      className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition active:scale-[0.99]"
      aria-label={`Ouvrir ${affectation.nom}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="break-words text-sm font-semibold text-gray-600">
            {mission?.missionName ?? "Mission"}
          </p>
          <h2 className="mt-2 break-words text-lg font-bold text-gray-950">
            {affectation.nom}
          </h2>
          <p className="mt-1 break-words text-sm text-gray-600">
            {affectation.immatriculation}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-bleu text-white">
          <ChevronRight size={22} aria-hidden="true" />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span
          className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${getStatutClasses(statut)}`}
        >
          {statut}
        </span>
        <span className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-600">
          <Gauge size={14} aria-hidden="true" />
          {affectation.type}
        </span>
      </div>

      <div className="mt-4 space-y-2 border-t border-gray-100 pt-3 text-sm text-gray-600">
        {mission?.lieuMission && (
          <p className="flex gap-2">
            <MapPin size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span className="break-words">{mission.lieuMission}</span>
          </p>
        )}
        <p>
          {formatDate(mission?.debutMission)} - {formatDate(mission?.finMission)}
        </p>
      </div>
    </Link>
  );
}

export default VehiculeMissionCard;
