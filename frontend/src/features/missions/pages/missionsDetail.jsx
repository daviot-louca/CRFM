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
        setError(
          err.message ||
          "Erreur lors du chargement de la mission"
        );
        setLoading(false);
      });
  }, [missionsId]);

  const statusColors = {
    "En cours":
      "bg-blue-100 text-blue-700",
    Terminée:
      "bg-green-100 text-green-700",
    Annulée:
      "bg-red-100 text-red-700",
    Planifiée:
      "bg-yellow-100 text-yellow-700",
  };

  const getUserName = (user) => {
    if (!user) return "N/A";

    return [
      user.grade,
      user.lastName ?? user.nom,
      user.firstName ?? user.prenom,
    ]
      .filter(Boolean)
      .join(" ");
  };

  const getConducteurName = (vehicule) => {

    const conducteur = vehicule?.conducteur;

    if (!conducteur) {

      return "Aucun conducteur affecté";

    }

    // Le backend renvoie actuellement le nom

    // directement sous forme de chaîne.

    if (typeof conducteur === "string") {

      return conducteur;

    }

    // Compatibilité si le backend renvoie

    // directement un objet User.

    if (typeof conducteur === "object") {

      return getUserName(conducteur);

    }

    return String(conducteur);

  };

  const getVehiculeName = (vehicule) => {
    return (
      vehicule?.nom ??
      vehicule?.vehiculeName ??
      vehicule?.name ??
      "Véhicule inconnu"
    );
  };

  const getVehiculeType = (vehicule) => {
    if (typeof vehicule?.type === "string") {
      return vehicule.type;
    }

    return (
      vehicule?.type?.nom ??
      vehicule?.type?.name ??
      vehicule?.vehiculeType?.nom ??
      vehicule?.vehiculeType?.name ??
      "Type non renseigné"
    );
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-100 p-6">
          <p className="text-gray-700">
            Chargement de la mission...
          </p>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-100 p-6">
          <p className="text-red-600">
            Erreur : {error}
          </p>
        </div>
      </MainLayout>
    );
  }

  if (!mission) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-100 p-6">
          <p className="text-gray-700">
            Mission non trouvée.
          </p>
        </div>
      </MainLayout>
    );
  }

  const oaResponsable = mission?.oa
    ? `${mission.oa.grade || ""} ${mission.oa.lastName ||
      mission.oa.nom ||
      ""
      }`.trim()
    : mission?.oaResponsable || "N/A";

  /*
   * On récupère les véhicules directement depuis
   * la mission.
   *
   * Le backend doit idéalement renvoyer :
   *
   * {
   *   vehiculeName: "...",
   *   immatriculation: "...",
   *   conducteur: {
   *     id: "...",
   *     nom: "...",
   *     prenom: "...",
   *     grade: "..."
   *   }
   * }
   */

  const vehiculesMission = mission?.vehicules ?? [];

  return (
    <MainLayout>
      <div className="min-h-screen space-y-10 bg-gray-100 p-6">

        {/* Command Header */}

        <div className="flex flex-col items-start justify-between gap-8 rounded-2xl border bg-white p-8 shadow md:flex-row">

          <div className="flex-1">

            <h1 className="mb-4 text-5xl font-extrabold text-slate-900">
              {mission.missionName}
            </h1>

            <div className="flex flex-wrap items-center gap-3">

              <span
                className={`inline-block rounded-full px-5 py-2 text-sm font-semibold ${statusColors[
                  mission.StatutMission
                ] ||
                  "bg-gray-200 text-gray-700"
                  }`}
              >
                {mission.StatutMission}
              </span>

              <span className="inline-block rounded-full bg-gray-200 px-5 py-2 text-sm font-semibold uppercase text-gray-700">
                {mission.typeMission}
              </span>

              <span className="inline-block rounded-full bg-gray-200 px-5 py-2 text-sm font-semibold uppercase text-gray-700">
                {mission.lieuMission}
              </span>

            </div>

          </div>

          <div className="flex w-64 flex-col gap-4 rounded-xl border border-gray-300 bg-gray-50 p-6 text-slate-700">

            <div>
              <span className="mb-1 block font-semibold text-slate-900">
                Début
              </span>

              <span>
                {new Date(
                  mission.debutMission
                ).toLocaleDateString("FR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "2-digit",
                })}
              </span>
            </div>

            <div>
              <span className="mb-1 block font-semibold text-slate-900">
                Fin
              </span>

              <span>
                {new Date(
                  mission.finMission
                ).toLocaleDateString("FR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "2-digit",
                })}
              </span>
            </div>

            <div>
              <span className="mb-1 block font-semibold text-slate-900">
                OA Responsable
              </span>

              <span>{oaResponsable}</span>
            </div>

            <div>
              <span className="mb-1 block font-semibold text-slate-900">
                ID Mission
              </span>

              <span>{missionsId}</span>
            </div>

          </div>
        </div>

        {/* Centre de commandement */}

        <section className="grid grid-cols-1 gap-8 md:grid-cols-2">

          <div className="flex flex-col gap-4 rounded-2xl border bg-white p-6 shadow">

            <h2 className="mb-2 text-2xl font-semibold text-slate-900">
              Centre de commandement
            </h2>

            <p className="mb-4 text-sm text-slate-500">
              Synthèse des effectifs et de la chaîne
              de commandement.
            </p>

            <div className="grid grid-cols-2 gap-4">

              <div className="rounded-xl border bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  OA Responsable
                </p>

                <p className="mt-1 text-lg font-bold text-slate-900">
                  {oaResponsable || "N/A"}
                </p>
              </div>

              <div className="rounded-xl border bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Statut
                </p>

                <span
                  className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-semibold ${statusColors[
                    mission?.statistiques
                      ?.statut
                  ] ||
                    "bg-gray-200 text-gray-700"
                    }`}
                >
                  {mission?.statistiques
                    ?.statut || "N/A"}
                </span>
              </div>

              <div className="rounded-xl border bg-slate-50 p-4 text-center">
                <p className="text-3xl font-bold text-slate-900">
                  {mission?.statistiques
                    ?.compagnies ?? 0}
                </p>

                <p className="mt-1 text-xs font-semibold uppercase text-slate-500">
                  Compagnies
                </p>
              </div>

              <div className="rounded-xl border bg-slate-50 p-4 text-center">
                <p className="text-3xl font-bold text-slate-900">
                  {mission?.statistiques
                    ?.groupes ?? 0}
                </p>

                <p className="mt-1 text-xs font-semibold uppercase text-slate-500">
                  Groupes
                </p>
              </div>

              <div className="rounded-xl border bg-slate-50 p-4 text-center">
                <p className="text-3xl font-bold text-slate-900">
                  {mission?.statistiques
                    ?.conducteurs ?? 0}
                </p>

                <p className="mt-1 text-xs font-semibold uppercase text-slate-500">
                  Conducteurs
                </p>
              </div>

              <div className="rounded-xl border bg-slate-50 p-4 text-center">
                <p className="text-3xl font-bold text-slate-900">
                  {mission?.statistiques?.x ??
                    0}
                </p>

                <p className="mt-1 text-xs font-semibold uppercase text-slate-500">
                  Militaires (X)
                </p>
              </div>

              <div className="rounded-xl border bg-slate-50 p-4 text-center">
                <p className="text-3xl font-bold text-slate-900">
                  {mission?.statistiques?.y ??
                    0}
                </p>

                <p className="mt-1 text-xs font-semibold uppercase text-slate-500">
                  Sous-officiers (Y)
                </p>
              </div>

              <div className="rounded-xl border bg-slate-50 p-4 text-center">
                <p className="text-3xl font-bold text-slate-900">
                  {mission?.statistiques?.z ??
                    0}
                </p>

                <p className="mt-1 text-xs font-semibold uppercase text-slate-500">
                  Officiers (Z)
                </p>
              </div>

            </div>
          </div>

          {/* Ordre de mission */}

          <div className="flex flex-col gap-4 rounded-2xl border bg-white p-6 shadow">

            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              Ordre de mission
            </h2>

            <div className="space-y-2 text-sm font-medium text-slate-700">

              <div>
                <span className="font-semibold text-slate-900">
                  Description :{" "}
                </span>

                {mission.missionDescription}
              </div>

              <div>
                <span className="font-semibold text-slate-900">
                  Lieu :{" "}
                </span>

                {mission.lieuMission}
              </div>

              <div>
                <span className="font-semibold text-slate-900">
                  Type :{" "}
                </span>

                {mission.typeMission}
              </div>

              <div>
                <span className="font-semibold text-slate-900">
                  Début :{" "}
                </span>

                {new Date(
                  mission.debutMission
                ).toLocaleDateString("FR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "2-digit",
                })}
              </div>

              <div>
                <span className="font-semibold text-slate-900">
                  Fin :{" "}
                </span>

                {new Date(
                  mission.finMission
                ).toLocaleDateString("FR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "2-digit",
                })}
              </div>

            </div>
          </div>

        </section>

        {/* Operational Hierarchy */}

        <section>

          {mission?.compagnies?.map(
            (c, idx) => (
              <div
                key={idx}
                className="mb-8 rounded-2xl border border-gray-300 bg-white p-6 shadow"
              >

                <h3 className="mb-2 text-3xl font-bold text-slate-900">
                  {c.nom || "N/A"}
                </h3>

                <div className="mb-6 font-semibold text-slate-700">
                  OA : {oaResponsable || "N/A"}
                </div>

                <div className="space-y-6">

                  {mission?.groupes
                    ?.filter(
                      (g) =>
                        g.compagnie ===
                        c.nom
                    )
                    .map(
                      (g, gidx) => (
                        <div
                          key={gidx}
                          className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-5"
                        >

                          <div className="flex items-center justify-between">

                            <h4 className="text-xl font-bold text-slate-900">
                              {g.nom ||
                                "N/A"}
                            </h4>

                            <span className="font-medium text-slate-700">
                              SOA :{" "}
                              {g.soa ||
                                "N/A"}
                            </span>

                          </div>

                          <div className="flex flex-wrap gap-6 text-sm font-medium text-slate-700">

                            <div>
                              <span>
                                Véhicule :{" "}
                              </span>

                              <span className="font-normal">
                                {g.vehicule ||
                                  "N/A"}
                              </span>
                            </div>

                            <div>
                              <span>
                                Conducteur :{" "}
                              </span>

                              <span className="font-normal">
                                {g.conducteur ||
                                  "N/A"}
                              </span>
                            </div>

                            <div>
                              <span>
                                Effectif :{" "}
                              </span>

                              <span className="font-normal">
                                {g.effectif ??
                                  "N/A"}
                              </span>
                            </div>

                          </div>

                          <div className="flex gap-3">

                            <span className="rounded bg-gray-200 px-3 py-1 text-xs font-semibold text-slate-700">
                              X:{" "}
                              {g.x ?? "N/A"}
                            </span>

                            <span className="rounded bg-gray-200 px-3 py-1 text-xs font-semibold text-slate-700">
                              Y:{" "}
                              {g.y ?? "N/A"}
                            </span>

                            <span className="rounded bg-gray-200 px-3 py-1 text-xs font-semibold text-slate-700">
                              Z:{" "}
                              {g.z ?? "N/A"}
                            </span>

                          </div>

                          <div className="mt-2 flex flex-wrap gap-2">

                            {g.militaires?.map(
                              (m, i) => (
                                <span
                                  key={i}
                                  className="inline-block rounded-full bg-gray-200 px-4 py-1 text-xs font-medium text-slate-700"
                                >
                                  {m}
                                </span>
                              )
                            )}

                          </div>

                        </div>
                      )
                    )}

                </div>
              </div>
            )
          )}

        </section>

        {/* Tactical Vehicles */}

        <section>

          <div className="mb-6 flex items-center justify-between">

            <h2 className="text-2xl font-semibold text-slate-900">
              Véhicules
            </h2>

            <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
              {vehiculesMission.length} véhicule
              {vehiculesMission.length >
                1
                ? "s"
                : ""}
            </span>

          </div>

          {vehiculesMission.length === 0 ? (
            <div className="rounded-2xl border border-gray-300 bg-white p-8 text-center shadow">
              <p className="text-sm text-gray-500">
                Aucun véhicule affecté à cette
                mission.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">

              {vehiculesMission.map(
                (v, idx) => (
                  <div
                    key={v.id ?? idx}
                    className="rounded-xl border border-gray-300 bg-white p-5 shadow"
                  >

                    <div className="mb-4">

                      <h3 className="text-lg font-bold text-slate-900">
                        {getVehiculeName(v)}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {v.immatriculation ||
                          "Immatriculation non renseignée"}
                      </p>

                    </div>

                    <div className="space-y-3 text-sm text-slate-700">

                      <div className="rounded-lg bg-gray-50 p-3">

                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Conducteur
                        </p>

                        <p className="mt-1 font-semibold text-slate-900">
                          {getConducteurName(
                            v
                          )}
                        </p>

                      </div>

                      <div>

                        <span className="font-semibold">
                          Type :{" "}
                        </span>

                        <span>
                          {getVehiculeType(v)}
                        </span>

                      </div>

                      <div>

                        <span className="font-semibold">
                          Groupe :{" "}
                        </span>

                        <span>
                          {v.groupe ||
                            "N/A"}
                        </span>

                      </div>

                      <div>

                        <span className="font-semibold">
                          Places :{" "}
                        </span>

                        <span>
                          {v.places ??
                            "N/A"}
                        </span>

                      </div>

                    </div>

                    <div className="mt-4">

                      <span className="text-xs font-semibold text-slate-700">
                        Passagers :
                      </span>

                      <div className="mt-2 flex flex-wrap gap-2">

                        {v.passagers?.length >
                          0 ? (
                          v.passagers.map(
                            (p, i) => (
                              <span
                                key={i}
                                className="inline-block rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-slate-700"
                              >
                                {typeof p ===
                                  "string"
                                  ? p
                                  : getUserName(
                                    p
                                  )}
                              </span>
                            )
                          )
                        ) : (
                          <span className="text-xs italic text-gray-400">
                            Aucun passager
                          </span>
                        )}

                      </div>

                    </div>

                  </div>
                )
              )}

            </div>
          )}

        </section>

      </div>
    </MainLayout>
  );
}
