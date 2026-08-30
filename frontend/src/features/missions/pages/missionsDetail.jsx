import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { getMissionById } from "../api/missions.api";

export default function MissionDetail() {
  const { missionsId } = useParams();
  const navigate = useNavigate();

  const [mission, setMission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isActive = true;

    const loadMission = async () => {
      try {
        const data = await getMissionById(missionsId);
        console.log(
          "[MISSION DETAIL] VEHICULES API :",
          data?.vehicules
        );
        
        console.log(
          "[MISSION DETAIL] PREMIER VEHICULE :",
          data?.vehicules?.[0]
        );
        
        console.log(
          "[MISSION DETAIL] PLEINS :",
          data?.vehicules?.[0]?.pleins
        );
        
        console.log(
          "[MISSION DETAIL] NOMBRE PLEINS :",
          data?.vehicules?.[0]?.nombrePleins
        );
        
        console.log(
          "[MISSION DETAIL] LITRES :",
          data?.vehicules?.[0]?.litresPleins
        );
        if (isActive) {
          setMission(data);
          setError(null);
        }
      } catch (err) {
        if (isActive) {
          setError(
            err.message ||
            "Erreur lors du chargement de la mission"
          );
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadMission();

    return () => {
      isActive = false;
    };
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
    "En préparation":
      "bg-orange-100 text-orange-700",
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
    const conducteur =
      vehicule?.conducteur;

    if (!conducteur) {
      return "Aucun conducteur affecté";
    }

    if (typeof conducteur === "string") {
      return conducteur;
    }

    if (
      typeof conducteur === "object"
    ) {
      return getUserName(
        conducteur
      );
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
    if (
      typeof vehicule?.type ===
      "string"
    ) {
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

  const getReleve = (vehicule) => {
    return (
      vehicule?.releve ??
      vehicule?.conducteurReleve ??
      vehicule?.missionsVehiculesReleve ??
      null
    );
  };
  const formatDateTime = (value) => {
    if (!value) return "Non renseignée";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Non renseignée";
    }

    return date.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
    : mission?.oaResponsable ||
    "N/A";

  const vehiculesMission =
    mission?.vehicules ?? [];

  const groupesMission =
    mission?.groupes ?? [];

  /*
   * ==========================================
   * PROGRESSION DE LA PRÉPARATION
   * ==========================================
   */

  const etape1Terminee = Boolean(
    mission?.id
  );

  const etape2Terminee =
    groupesMission.length > 0;

  const etape3Terminee =
    vehiculesMission.length > 0;

  const conducteursTousAffectes =
    vehiculesMission.length > 0 &&
    vehiculesMission.every(
      (vehicule) =>
        Boolean(
          vehicule?.conducteurId ??
          vehicule?.conducteur?.id ??
          vehicule?.conducteur
        )
    );

  const soaSelectionne =
    groupesMission.length > 0 &&
    groupesMission.every(
      (groupe) =>
        Boolean(
          groupe?.soaId ??
          groupe?.soa?.id ??
          groupe?.soa
        )
    );

  const etape4Terminee =
    soaSelectionne;

  const etape5Terminee =
    soaSelectionne &&
    conducteursTousAffectes;

  const donneesConducteurRenseignees =
    vehiculesMission.length > 0 &&
    vehiculesMission.every((vehicule) => {
      const releve =
        getReleve(vehicule);

      return Boolean(
        releve &&
        (
          releve.modeReleve ||
          (
            releve.valeurDepart !==
            null &&
            releve.valeurDepart !==
            undefined
          ) ||
          releve.dateDepart ||
          (
            releve.valeurArrivee !==
            null &&
            releve.valeurArrivee !==
            undefined
          ) ||
          releve.dateArrivee
        )
      );
    });

  const etapes = [
    {
      numero: 1,
      titre:
        "Informations générales",
      description:
        "Les informations principales de la mission sont renseignées.",
      terminee:
        etape1Terminee,
    },
    {
      numero: 2,
      titre:
        "Affectation des groupes",
      description:
        "Les groupes et les militaires concernés sont définis.",
      terminee:
        etape2Terminee,
    },
    {
      numero: 3,
      titre:
        "Affectation des véhicules",
      description:
        "Les véhicules sont affectés aux différents groupes.",
      terminee:
        etape3Terminee,
    },
    {
      numero: 4,
      titre:
        "Affectation du SOA",
      description:
        "Le SOA responsable de chaque groupe est défini.",
      terminee:
        etape4Terminee,
    },
    {
      numero: 5,
      titre:
        "Affectation des conducteurs",
      description:
        conducteursTousAffectes
          ? "Chaque véhicule dispose de son conducteur."
          : "Les conducteurs restent à affecter.",
      terminee:
        etape5Terminee,
    },
    {
      numero: 6,
      titre:
        "Données conducteur",
      description:
        donneesConducteurRenseignees
          ? "Les données des conducteurs ont été renseignées et sont disponibles dans le détail de la mission."
          : "Les données des conducteurs restent à renseigner.",
      terminee:
        donneesConducteurRenseignees,
    },
  ];

  const nombreEtapesTerminees =
    etapes.filter(
      (etape) => etape.terminee
    ).length;

  const progression = Math.round(
    (nombreEtapesTerminees /
      etapes.length) *
    100
  );

  const prochaineEtape =
    etapes.find(
      (etape) => !etape.terminee
    );

  /*
   * ==========================================
   * CONTINUER LA PRÉPARATION
   * ==========================================
   */

  const handleContinuerMission =
    () => {
      if (!prochaineEtape) {
        return;
      }

      const routesEtapes = {
        2: `/admin/creer-missions-2?missionId=${missionsId}`,
        3: `/admin/creer-missions-3?missionId=${missionsId}`,
        4: `/admin/creer-missions-4?missionId=${missionsId}`,
        5: `/admin/creer-missions-5?missionId=${missionsId}`,
        6: null,
      };

      const route =
        routesEtapes[
        prochaineEtape.numero
        ];

      if (route) {
        navigate(route);
      }
    };

  return (
    <MainLayout>
      <div className="min-h-screen space-y-10 bg-gray-100 p-6">

        {/* ==========================================
            HEADER
        ========================================== */}

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
                ).toLocaleDateString(
                  "FR",
                  {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                  }
                )}
              </span>
            </div>

            <div>
              <span className="mb-1 block font-semibold text-slate-900">
                Fin
              </span>

              <span>
                {new Date(
                  mission.finMission
                ).toLocaleDateString(
                  "FR",
                  {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                  }
                )}
              </span>
            </div>

            <div>
              <span className="mb-1 block font-semibold text-slate-900">
                OA Responsable
              </span>

              <span>
                {oaResponsable}
              </span>
            </div>

            <div>
              <span className="mb-1 block font-semibold text-slate-900">
                ID Mission
              </span>

              <span>
                {missionsId}
              </span>
            </div>

          </div>

        </div>

        {/* ==========================================
            TIMELINE DE PRÉPARATION
        ========================================== */}

        <section className="rounded-2xl border bg-white p-6 shadow">

          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">

            <div>

              <h2 className="text-2xl font-semibold text-slate-900">
                Préparation de la mission
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Suivez l'avancement de la préparation de cette mission.
              </p>

            </div>

            <div className="text-left md:text-right">

              <p className="text-3xl font-bold text-slate-900">
                {progression}%
              </p>

              <p className="text-xs font-semibold uppercase text-slate-500">
                {nombreEtapesTerminees} /{" "}
                {etapes.length} étapes
              </p>

            </div>

          </div>

          <div className="mb-8 h-3 w-full overflow-hidden rounded-full bg-slate-200">

            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-500"
              style={{
                width: `${progression}%`,
              }}
            />

          </div>

          <div className="relative">

            {etapes.map(
              (etape, index) => {

                const derniere =
                  index ===
                  etapes.length - 1;

                return (
                  <div
                    key={etape.numero}
                    className="relative flex gap-4"
                  >

                    {!derniere && (
                      <div
                        className={`absolute left-3.75 top-8 h-full w-0.5 ${etape.terminee
                          ? "bg-blue-600"
                          : "bg-slate-200"
                          }`}
                      />
                    )}

                    <div
                      className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold ${etape.terminee
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-300 bg-white text-slate-400"
                        }`}
                    >
                      {etape.terminee
                        ? "✓"
                        : etape.numero}
                    </div>

                    <div
                      className={`mb-8 flex-1 rounded-xl border p-4 ${etape.terminee
                        ? "border-blue-100 bg-blue-50"
                        : "border-slate-200 bg-slate-50"
                        }`}
                    >

                      <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">

                        <div>

                          <h3
                            className={`font-bold ${etape.terminee
                              ? "text-slate-900"
                              : "text-slate-500"
                              }`}
                          >
                            Étape{" "}
                            {etape.numero} —{" "}
                            {etape.titre}
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            {
                              etape.description
                            }
                          </p>

                        </div>

                        <span
                          className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${etape.terminee
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-200 text-slate-500"
                            }`}
                        >
                          {etape.terminee
                            ? "Terminée"
                            : "À faire"}
                        </span>

                      </div>

                    </div>

                  </div>
                );
              }
            )}

          </div>

          {prochaineEtape && prochaineEtape.numero !== 6 ? (
            <div className="mt-2 flex flex-col gap-4 rounded-xl border border-yellow-200 bg-yellow-50 p-4 md:flex-row md:items-center md:justify-between">

              <div>

                <p className="text-sm font-semibold text-yellow-800">
                  Prochaine étape
                </p>

                <p className="mt-1 text-sm text-yellow-700">
                  Étape {prochaineEtape.numero} — {prochaineEtape.titre}
                </p>

              </div>

              <button
                type="button"
                onClick={handleContinuerMission}
                className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 md:w-auto"
              >
                Continuer la mission →
              </button>

            </div>

          ) : prochaineEtape?.numero === 6 ? (

            <div className="mt-2 rounded-xl border border-yellow-200 bg-yellow-50 p-4">

              <p className="font-semibold text-yellow-800">
                Données conducteur en attente
              </p>

              <p className="mt-1 text-sm text-yellow-700">
                Les données doivent être renseignées par les conducteurs. Aucun bouton d'action n'est nécessaire ici.
              </p>

            </div>

          ) : (

            <div className="mt-2 rounded-xl border border-green-200 bg-green-50 p-4">

              <p className="font-semibold text-green-800">
                ✓ Mission prête
              </p>

              <p className="mt-1 text-sm text-green-700">
                Toutes les étapes de préparation sont terminées.
              </p>

            </div>

          )}

        </section>

        {/* ==========================================
            CENTRE DE COMMANDEMENT
        ========================================== */}

        <section className="grid grid-cols-1 gap-8 md:grid-cols-2">

          <div className="flex flex-col gap-4 rounded-2xl border bg-white p-6 shadow">

            <h2 className="mb-2 text-2xl font-semibold text-slate-900">
              Centre de commandement
            </h2>

            <p className="mb-4 text-sm text-slate-500">
              Synthèse des effectifs et de la chaîne de commandement.
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
                    mission?.statistiques?.statut
                  ] ||
                    "bg-gray-200 text-gray-700"
                    }`}
                >
                  {mission?.statistiques?.statut ||
                    "N/A"}
                </span>
              </div>

              <div className="rounded-xl border bg-slate-50 p-4 text-center">
                <p className="text-3xl font-bold text-slate-900">
                  {mission?.statistiques?.compagnies ?? 0}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase text-slate-500">
                  Compagnies
                </p>
              </div>

              <div className="rounded-xl border bg-slate-50 p-4 text-center">
                <p className="text-3xl font-bold text-slate-900">
                  {mission?.statistiques?.groupes ?? 0}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase text-slate-500">
                  Groupes
                </p>
              </div>

              <div className="rounded-xl border bg-slate-50 p-4 text-center">
                <p className="text-3xl font-bold text-slate-900">
                  {mission?.statistiques?.conducteurs ?? 0}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase text-slate-500">
                  Conducteurs
                </p>
              </div>

              <div className="rounded-xl border bg-slate-50 p-4 text-center">
                <p className="text-3xl font-bold text-slate-900">
                  {mission?.statistiques?.x ?? 0}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase text-slate-500">
                  Militaires (X)
                </p>
              </div>

              <div className="rounded-xl border bg-slate-50 p-4 text-center">
                <p className="text-3xl font-bold text-slate-900">
                  {mission?.statistiques?.y ?? 0}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase text-slate-500">
                  Sous-officiers (Y)
                </p>
              </div>

              <div className="rounded-xl border bg-slate-50 p-4 text-center">
                <p className="text-3xl font-bold text-slate-900">
                  {mission?.statistiques?.z ?? 0}
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
                ).toLocaleDateString(
                  "FR",
                  {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                  }
                )}
              </div>

              <div>
                <span className="font-semibold text-slate-900">
                  Fin :{" "}
                </span>

                {new Date(
                  mission.finMission
                ).toLocaleDateString(
                  "FR",
                  {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                  }
                )}
              </div>

            </div>

          </div>

        </section>

        {/* ==========================================
            DONNÉES CONDUCTEUR
        ========================================== */}

        <section className="rounded-2xl border bg-white p-6 shadow">

          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">

            <div>

              <h2 className="text-2xl font-semibold text-slate-900">
                Données conducteur
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Données renseignées par les conducteurs affectés aux véhicules.
              </p>

            </div>

          </div>

          {vehiculesMission.length === 0 ? (

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center">

              <p className="text-sm text-gray-500">
                Aucun véhicule affecté à cette mission.
              </p>

            </div>

          ) : (

            <div className="space-y-6">

              {vehiculesMission.map(
                (vehicule, index) => {

                  const conducteur =
                    vehicule?.conducteur;

                  const releve =
                    getReleve(vehicule);

                  const donneesRenseignees =
                    Boolean(
                      releve &&
                      (
                        releve.modeReleve ||
                        (
                          releve.valeurDepart !==
                          null &&
                          releve.valeurDepart !==
                          undefined
                        ) ||
                        releve.dateDepart ||
                        (
                          releve.valeurArrivee !==
                          null &&
                          releve.valeurArrivee !==
                          undefined
                        ) ||
                        releve.dateArrivee
                      )
                    );

                  return (
                    <div
                      key={
                        vehicule?.id ??
                        index
                      }
                      className="rounded-xl border border-gray-200 bg-gray-50 p-5"
                    >

                      <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">

                        <div>

                          <h3 className="text-xl font-bold text-slate-900">
                            {getVehiculeName(
                              vehicule
                            )}
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            {vehicule?.immatriculation ||
                              "Immatriculation non renseignée"}
                          </p>

                        </div>

                        <span
                          className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${donneesRenseignees
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                            }`}
                        >
                          {donneesRenseignees
                            ? "Données renseignées"
                            : "En attente des données conducteur"}
                        </span>

                      </div>

                      <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2">

                        <div className="rounded-lg border bg-white p-4">

                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Conducteur
                          </p>

                          <p className="mt-1 font-semibold text-slate-900">
                            {getConducteurName(
                              vehicule
                            )}
                          </p>

                        </div>

                        <div className="rounded-lg border bg-white p-4">

                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">

                            Pleins

                          </p>

                          <p className="mt-1 font-semibold text-slate-900">

                            {vehicule.nombrePleins ?? 0}

                          </p>

                          <p className="mt-1 text-sm text-slate-500">

                            {Number(

                              vehicule.litresPleins ?? 0

                            ).toLocaleString("fr-FR", {

                              minimumFractionDigits: 2,

                              maximumFractionDigits: 2,

                            })}{" "}

                            L

                          </p>

                        </div>

                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                        <div className="rounded-lg border bg-white p-4">

                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Mode de relevé
                          </p>

                          <p className="mt-1 font-semibold text-slate-900">
                            {releve?.modeReleve ||
                              "Non renseigné"}
                          </p>

                        </div>

                        <div className="rounded-lg border bg-white p-4">

                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Départ
                          </p>

                          <p className="mt-1 font-semibold text-slate-900">
                            {releve?.valeurDepart ??
                              "Non renseigné"}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {formatDateTime(
                              releve?.dateDepart
                            )}
                          </p>

                        </div>

                        <div className="rounded-lg border bg-white p-4">

                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Arrivée
                          </p>

                          <p className="mt-1 font-semibold text-slate-900">
                            {releve?.valeurArrivee ??
                              "Non renseigné"}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {formatDateTime(
                              releve?.dateArrivee
                            )}
                          </p>

                        </div>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          )}

        </section>

        {/* ==========================================
            HIÉRARCHIE OPÉRATIONNELLE
        ========================================== */}

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
                  OA :{" "}
                  {oaResponsable ||
                    "N/A"}
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
                              {g.x ??
                                "N/A"}
                            </span>

                            <span className="rounded bg-gray-200 px-3 py-1 text-xs font-semibold text-slate-700">
                              Y:{" "}
                              {g.y ??
                                "N/A"}
                            </span>

                            <span className="rounded bg-gray-200 px-3 py-1 text-xs font-semibold text-slate-700">
                              Z:{" "}
                              {g.z ??
                                "N/A"}
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

        {/* ==========================================
            VÉHICULES
        ========================================== */}

        <section>

          <div className="mb-6 flex items-center justify-between">

            <h2 className="text-2xl font-semibold text-slate-900">
              Véhicules
            </h2>

            <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
              {vehiculesMission.length}{" "}
              véhicule
              {vehiculesMission.length >
                1
                ? "s"
                : ""}
            </span>

          </div>

          {vehiculesMission.length ===
            0 ? (

            <div className="rounded-2xl border border-gray-300 bg-white p-8 text-center shadow">

              <p className="text-sm text-gray-500">
                Aucun véhicule affecté à
                cette mission.
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
                        {getVehiculeName(
                          v
                        )}
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
                          {getVehiculeType(
                            v
                          )}
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

                        {v.passagers
                          ?.length >
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