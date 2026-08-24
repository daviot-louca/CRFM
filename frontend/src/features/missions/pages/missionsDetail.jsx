import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { getMissionById } from "../api/missions.api";

export default function MissionDetail() {
  const { missionsId } = useParams();
  const [mission, setMission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getMissionById(missionsId)
      .then((data) => {
        setMission(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Erreur lors du chargement de la mission");
        setLoading(false);
      });
  }, [missionsId]);

  const statusColors = {
    "En cours": "bg-blue-100 text-blue-700",
    "Terminée": "bg-green-100 text-green-700",
    "Annulée": "bg-red-100 text-red-700",
    "Planifiée": "bg-yellow-100 text-yellow-700",
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto p-6 bg-gray-100 min-h-screen">
          <p className="text-gray-700">Chargement de la mission...</p>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto p-6 bg-gray-100 min-h-screen">
          <p className="text-red-600">Erreur : {error}</p>
        </div>
      </MainLayout>
    );
  }

  if (!mission) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto p-6 bg-gray-100 min-h-screen">
          <p className="text-gray-700">Mission non trouvée.</p>
        </div>
      </MainLayout>
    );
  }
  const oaResponsable = mission?.oa
  ? `${mission.oa.grade || ""} ${mission.oa.lastName || mission.oa.nom || ""}`.trim()
  : mission?.oaResponsable || "N/A";
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto p-6 bg-gray-100 min-h-screen space-y-10">
        {/* Command Header */}
        <div className="bg-white rounded-2xl shadow border p-8 flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="flex-1">
            <h1 className="text-5xl font-extrabold text-slate-900 mb-4">{mission.missionName}</h1>
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`inline-block px-5 py-2 rounded-full text-sm font-semibold ${statusColors[mission.StatutMission] || "bg-gray-200 text-gray-700"}`}
              >
                {mission.StatutMission}
              </span>
              <span className="inline-block px-5 py-2 rounded-full bg-gray-200 text-gray-700 text-sm font-semibold uppercase">
                {mission.typeMission}
              </span>
              <span className="inline-block px-5 py-2 rounded-full bg-gray-200 text-gray-700 text-sm font-semibold uppercase">
                {mission.lieuMission}
              </span>
            </div>
          </div>
          <div className="w-64 bg-gray-50 rounded-xl border border-gray-300 p-6 flex flex-col gap-4 text-slate-700">
            <div>
              <span className="block font-semibold text-slate-900 mb-1">Début</span>
              <span>{new Date(mission.debutMission).toLocaleDateString("FR", { day: "2-digit", month: "2-digit", year: "2-digit" })}</span>
            </div>
            <div>
              <span className="block font-semibold text-slate-900 mb-1">Fin</span>
              <span>{new Date(mission.finMission).toLocaleDateString("FR", { day: "2-digit", month: "2-digit", year: "2-digit" })}</span>
            </div>
            <div>
              <span className="block font-semibold text-slate-900 mb-1">OA Responsable</span>
              <span>{oaResponsable}</span>
            </div>
            <div>
              <span className="block font-semibold text-slate-900 mb-1">ID Mission</span>
              <span>{missionsId}</span>
            </div>
          </div>
        </div>

        {/* Centre de commandement */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow border p-6 flex flex-col gap-4">
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">Centre de commandement</h2>
            <p className="text-sm text-slate-500 mb-4">Synthèse des effectifs et de la chaîne de commandement.</p>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border bg-slate-50 p-4">
                <p className="text-xs uppercase text-slate-500 font-semibold">OA Responsable</p>
                <p className="text-lg font-bold text-slate-900 mt-1">{oaResponsable || "N/A"}</p>
              </div>

              <div className="rounded-xl border bg-slate-50 p-4">
                <p className="text-xs uppercase text-slate-500 font-semibold">Statut</p>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold ${statusColors[mission?.statistiques?.statut] || "bg-gray-200 text-gray-700"}`}>
                  {mission?.statistiques?.statut || "N/A"}
                </span>
              </div>

              <div className="rounded-xl border bg-slate-50 p-4 text-center">
                <p className="text-3xl font-bold text-slate-900">{mission?.statistiques?.compagnies ?? 0}</p>
                <p className="text-xs uppercase text-slate-500 font-semibold mt-1">Compagnies</p>
              </div>

              <div className="rounded-xl border bg-slate-50 p-4 text-center">
                <p className="text-3xl font-bold text-slate-900">{mission?.statistiques?.groupes ?? 0}</p>
                <p className="text-xs uppercase text-slate-500 font-semibold mt-1">Groupes</p>
              </div>

              <div className="rounded-xl border bg-slate-50 p-4 text-center">
                <p className="text-3xl font-bold text-slate-900">{mission?.statistiques?.conducteurs ?? 0}</p>
                <p className="text-xs uppercase text-slate-500 font-semibold mt-1">Conducteurs</p>
              </div>

              <div className="rounded-xl border bg-slate-50 p-4 text-center">
                <p className="text-3xl font-bold text-slate-900">{mission?.statistiques?.x ?? 0}</p>
                <p className="text-xs uppercase text-slate-500 font-semibold mt-1">Militaires (X)</p>
              </div>

              <div className="rounded-xl border bg-slate-50 p-4 text-center">
                <p className="text-3xl font-bold text-slate-900">{mission?.statistiques?.y ?? 0}</p>
                <p className="text-xs uppercase text-slate-500 font-semibold mt-1">Sous-officiers (Y)</p>
              </div>

              <div className="rounded-xl border bg-slate-50 p-4 text-center">
                <p className="text-3xl font-bold text-slate-900">{mission?.statistiques?.z ?? 0}</p>
                <p className="text-xs uppercase text-slate-500 font-semibold mt-1">Officiers (Z)</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow border p-6 flex flex-col gap-4">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Ordre de mission</h2>
            <div className="space-y-2 text-slate-700 text-sm font-medium">
              <div>
                <span className="font-semibold text-slate-900">Description: </span>{mission.missionDescription}
              </div>
              <div>
                <span className="font-semibold text-slate-900">Lieu: </span>{mission.lieuMission}
              </div>
              <div>
                <span className="font-semibold text-slate-900">Type: </span>{mission.typeMission}
              </div>
              <div>
                <span className="font-semibold text-slate-900">Début: </span>
                {new Date(mission.debutMission).toLocaleDateString("FR", { day: "2-digit", month: "2-digit", year: "2-digit" })}
              </div>
              <div>
                <span className="font-semibold text-slate-900">Fin: </span>
                {new Date(mission.finMission).toLocaleDateString("FR", { day: "2-digit", month: "2-digit", year: "2-digit" })}
              </div>
            </div>
          </div>
        </section>

        {/* Operational Hierarchy */}
        <section>
          {mission?.compagnies?.map((c, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-gray-300 shadow p-6 mb-8">
              <h3 className="text-3xl font-bold text-slate-900 mb-2">{c.nom || "N/A"}</h3>
              <div className="text-slate-700 mb-6 font-semibold">OA: {oaResponsable || "N/A"}</div>
              <div className="space-y-6">
                {mission?.groupes
                  ?.filter((g) => g.compagnie === c.nom)
                  .map((g, gidx) => (
                    <div key={gidx} className="bg-gray-50 rounded-xl border border-gray-200 p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xl font-bold text-slate-900">{g.nom || "N/A"}</h4>
                        <span className="text-slate-700 font-medium">SOA: {g.soa || "N/A"}</span>
                      </div>
                      <div className="flex flex-wrap gap-6 text-slate-700 font-medium text-sm">
                        <div>
                          <span>Véhicule: </span>
                          <span className="font-normal">{g.vehicule || "N/A"}</span>
                        </div>
                        <div>
                          <span>Conducteur: </span>
                          <span className="font-normal">{g.conducteur || "N/A"}</span>
                        </div>
                        <div>
                          <span>Effectif: </span>
                          <span className="font-normal">{g.effectif ?? "N/A"}</span>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <span className="bg-gray-200 text-slate-700 rounded px-3 py-1 text-xs font-semibold">X: {g.x ?? "N/A"}</span>
                        <span className="bg-gray-200 text-slate-700 rounded px-3 py-1 text-xs font-semibold">Y: {g.y ?? "N/A"}</span>
                        <span className="bg-gray-200 text-slate-700 rounded px-3 py-1 text-xs font-semibold">Z: {g.z ?? "N/A"}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {g.militaires?.map((m, i) => (
                          <span
                            key={i}
                            className="inline-block bg-gray-200 text-slate-700 rounded-full px-4 py-1 text-xs font-medium"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </section>

        {/* Tactical Vehicles */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">Véhicules</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {mission?.vehicules?.map((v, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-gray-300 shadow p-4 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">{v.nom || "N/A"}</h3>
                  <span className="text-slate-700 font-medium text-sm">Immatriculation: {v.immatriculation || "N/A"}</span>
                </div>
                <div className="flex flex-wrap gap-4 text-slate-700 font-medium text-xs">
                  <div>
                    <span className="font-semibold">Type:</span> <span className="font-normal">{v.type || "N/A"}</span>
                  </div>
                  <div>
                    <span className="font-semibold">Conducteur:</span> <span className="font-normal">{v.conducteur || "N/A"}</span>
                  </div>
                  <div>
                    <span className="font-semibold">Groupe:</span> <span className="font-normal">{v.groupe || "N/A"}</span>
                  </div>
                  <div>
                    <span className="font-semibold">Places:</span> <span className="font-normal">{v.places ?? "N/A"}</span>
                  </div>
                </div>
                <div>
                  <span className="font-semibold text-slate-700 text-xs">Passagers:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {v.passagers?.map((p, i) => (
                      <span
                        key={i}
                        className="inline-block bg-gray-200 text-slate-700 rounded-full px-3 py-0.5 text-xs font-medium"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </MainLayout>
  );
}