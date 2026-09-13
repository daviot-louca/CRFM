import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getMissions } from "../../features/missions/api/missions.api";
import MainLayout from "@/components/layout/MainLayout";

function TableauDeBord() {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const role = String(
    user?.role?.roleName ||
      localStorage.getItem("userRole") ||
      ""
  ).toLowerCase();

  const nomUtilisateur =
    user?.lastName ||
    user?.nom ||
    localStorage.getItem("userLastName") ||
    "Utilisateur";

  const gradeUtilisateur =
    user?.grade ||
    localStorage.getItem("userGrade") ||
    "";

  useEffect(() => {
    const chargerMissions = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getMissions();
        setMissions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Erreur chargement dashboard :", err);
        setError(
          "Impossible de charger les données du tableau de bord."
        );
      } finally {
        setLoading(false);
      }
    };

    chargerMissions();
  }, []);

  const statistiques = useMemo(() => {
    const total = missions.length;

    const missionsEquipees = missions.filter(
      (mission) =>
        Array.isArray(mission.missionsVehicules) &&
        mission.missionsVehicules.length > 0
    ).length;

    const vehicules = missions.reduce(
      (totalVehicules, mission) =>
        totalVehicules +
        (Array.isArray(mission.missionsVehicules)
          ? mission.missionsVehicules.length
          : 0),
      0
    );

    const conducteursAffectes = missions.reduce(
      (totalConducteurs, mission) =>
        totalConducteurs +
        (Array.isArray(mission.missionsVehicules)
          ? mission.missionsVehicules.filter(
              (vehicule) => vehicule?.conducteurId
            ).length
          : 0),
      0
    );

    const vehiculesSansConducteur = missions.reduce(
      (totalSansConducteur, mission) =>
        totalSansConducteur +
        (Array.isArray(mission.missionsVehicules)
          ? mission.missionsVehicules.filter(
              (vehicule) => !vehicule?.conducteurId
            ).length
          : 0),
      0
    );

    return {
      total,
      missionsEquipees,
      missionsSansVehicule: total - missionsEquipees,
      vehicules,
      conducteursAffectes,
      vehiculesSansConducteur,
    };
  }, [missions]);

  const missionsRecentes = useMemo(() => {
    return [...missions]
      .sort((a, b) => {
        const dateA = new Date(
          a.dateDebut || a.createdAt || 0
        ).getTime();

        const dateB = new Date(
          b.dateDebut || b.createdAt || 0
        ).getTime();

        return dateB - dateA;
      })
      .slice(0, 6);
  }, [missions]);

  const getEtatMission = (mission) => {
    const vehicules = Array.isArray(
      mission.missionsVehicules
    )
      ? mission.missionsVehicules
      : [];

    if (vehicules.length === 0) {
      return {
        label: "À préparer",
        tone: "danger",
      };
    }

    if (
      vehicules.some(
        (vehicule) => !vehicule?.conducteurId
      )
    ) {
      return {
        label: "À compléter",
        tone: "warning",
      };
    }

    return {
      label: "Prête",
      tone: "success",
    };
  };

  const formaterDate = (date) => {
    if (!date) return "—";

    const valeur = new Date(date);

    if (Number.isNaN(valeur.getTime())) {
      return "—";
    }

    return valeur.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const titreRole =
    role === "administrateur"
      ? "Administration"
      : role === "oal"
        ? "Officier adjoint logistique"
        : role === "soa"
          ? "Sous-officier adjoint"
          : "Tableau de bord";

  const descriptionRole =
    role === "administrateur"
      ? "Vue globale de l'activité et de l'état des missions."
      : role === "oal"
        ? "Pilotage et suivi de la préparation des missions."
        : "Suivi opérationnel des véhicules et des conducteurs.";

  if (loading) {
    return (
      <MainLayout>
        <main className="box-border min-h-full w-full min-w-0 bg-slate-50 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
          <div className="mx-auto flex min-h-[60vh] w-full max-w-7xl items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-bleu" />

              <p className="text-sm font-medium text-slate-500">
                Chargement du tableau de bord...
              </p>
            </div>
          </div>
        </main>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <main className="box-border min-h-full w-full min-w-0 bg-slate-50 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
          <div className="mx-auto w-full max-w-7xl">
            <div className="rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm sm:p-8">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                <AlertIcon />
              </div>

              <p className="mt-4 font-semibold text-slate-900">
                Une erreur est survenue
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {error}
              </p>
            </div>
          </div>
        </main>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <main className="box-border min-h-full w-full min-w-0 overflow-x-hidden bg-slate-50 px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-7">
        <div className="mx-auto w-full max-w-7xl space-y-5 sm:space-y-6">

          {/* HEADER */}

          <section className="relative overflow-hidden rounded-2xl bg-bleu px-5 py-6 shadow-lg sm:rounded-3xl sm:px-8 sm:py-8">
            <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-white/5 sm:h-64 sm:w-64" />

            <div className="pointer-events-none absolute -bottom-24 right-16 h-48 w-48 rounded-full bg-jaune/10" />

            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/60 sm:text-xs">
                  <span>CRFM</span>

                  <span className="h-1 w-1 rounded-full bg-jaune" />

                  <span>{titreRole}</span>
                </div>

                <h1 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                  Tableau de bord
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
                  Bonjour{" "}
                  {gradeUtilisateur
                    ? `${gradeUtilisateur} `
                    : ""}
                  {nomUtilisateur}.{" "}
                  {descriptionRole}
                </p>
              </div>

              <Link
                to="/admin/missions"
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-jaune px-4 py-2.5 text-sm font-bold text-bleu shadow-sm transition hover:brightness-95 active:scale-[0.98] sm:w-fit"
              >
                Voir les missions

                <ArrowIcon />
              </Link>
            </div>
          </section>

          {/* STATISTIQUES */}

          <section className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
            <StatCard
              title="Missions"
              value={statistiques.total}
              description={
                role === "administrateur"
                  ? "missions enregistrées"
                  : "missions à suivre"
              }
              icon="mission"
            />

            <StatCard
              title="Véhicules"
              value={statistiques.vehicules}
              description={`${statistiques.missionsEquipees} mission${
                statistiques.missionsEquipees > 1
                  ? "s"
                  : ""
              } équipée${
                statistiques.missionsEquipees > 1
                  ? "s"
                  : ""
              }`}
              icon="vehicle"
            />

            <StatCard
              title="Conducteurs"
              value={statistiques.conducteursAffectes}
              description="affectations réalisées"
              icon="user"
            />

            <StatCard
              title="À traiter"
              value={
                role === "soa"
                  ? statistiques.vehiculesSansConducteur
                  : statistiques.missionsSansVehicule
              }
              description={
                role === "soa"
                  ? "véhicules sans conducteur"
                  : "missions sans véhicule"
              }
              icon="alert"
              danger={
                role === "soa"
                  ? statistiques.vehiculesSansConducteur > 0
                  : statistiques.missionsSansVehicule > 0
              }
            />
          </section>

          {/* MISSIONS + SYNTHESE */}

          <section className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,1fr)] xl:gap-6">

            <DashboardCard
              title={
                role === "administrateur"
                  ? "Activité récente"
                  : "Missions à suivre"
              }
              subtitle="Accédez rapidement au détail d'une mission."
            >
              {missionsRecentes.length === 0 ? (
                <EmptyState message="Aucune mission disponible." />
              ) : (
                <div className="divide-y divide-slate-100">
                  {missionsRecentes.map((mission) => {
                    const etat =
                      getEtatMission(mission);

                    const vehicules =
                      Array.isArray(
                        mission.missionsVehicules
                      )
                        ? mission.missionsVehicules
                        : [];

                    const conducteurs =
                      vehicules.filter(
                        (vehicule) =>
                          vehicule?.conducteurId
                      ).length;

                    return (
                      <Link
                        key={mission.id}
                        to={`/admin/missions/${mission.id}`}
                        className="group flex min-w-0 flex-col gap-3 py-4 first:pt-1 last:pb-1 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-bleu transition group-hover:bg-bleu group-hover:text-white">
                            <MissionIcon />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900 transition group-hover:text-bleu">
                              {mission.nom ||
                                mission.name ||
                                `Mission #${mission.id}`}
                            </p>

                            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                              <span>
                                {formaterDate(
                                  mission.dateDebut
                                )}
                              </span>

                              <span>
                                {vehicules.length} véhicule
                                {vehicules.length > 1
                                  ? "s"
                                  : ""}
                              </span>

                              <span>
                                {conducteurs} conducteur
                                {conducteurs > 1
                                  ? "s"
                                  : ""}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 sm:justify-end">
                          <StatusBadge
                            label={etat.label}
                            tone={etat.tone}
                          />

                          <ArrowRightIcon />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </DashboardCard>

            <DashboardCard
              title="Synthèse"
              subtitle="Vue instantanée de l'activité."
            >
              <div className="space-y-1">
                <ProgressRow
                  label="Missions équipées"
                  value={statistiques.missionsEquipees}
                  total={statistiques.total}
                />

                <ProgressRow
                  label="Véhicules avec conducteur"
                  value={
                    statistiques.vehicules -
                    statistiques.vehiculesSansConducteur
                  }
                  total={statistiques.vehicules}
                />
              </div>

              <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  Point d'attention
                </p>

                <p className="mt-2 text-sm font-medium leading-5 text-slate-700">
                  {role === "soa" &&
                  statistiques.vehiculesSansConducteur >
                    0
                    ? `${statistiques.vehiculesSansConducteur} véhicule${
                        statistiques.vehiculesSansConducteur >
                        1
                          ? "s"
                          : ""
                      } attend${
                        statistiques.vehiculesSansConducteur >
                        1
                          ? "ent"
                          : ""
                      } encore un conducteur.`
                    : statistiques.missionsSansVehicule >
                        0
                      ? `${statistiques.missionsSansVehicule} mission${
                          statistiques.missionsSansVehicule >
                          1
                            ? "s"
                            : ""
                        } nécessite${
                          statistiques.missionsSansVehicule >
                          1
                            ? "nt"
                            : ""
                        } encore une affectation.`
                      : "Aucune anomalie d'affectation détectée sur les données disponibles."}
                </p>
              </div>
            </DashboardCard>
          </section>

          {/* ACTIONS */}

          <section className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            <QuickAction
              to="/admin/missions"
              title="Missions"
              description="Consulter l'ensemble des missions"
              icon="mission"
            />

            {role === "administrateur" && (
              <>
                <QuickAction
                  to="/admin/vehicules"
                  title="Véhicules"
                  description="Gérer le parc de véhicules"
                  icon="vehicle"
                />

                <QuickAction
                  to="/admin/compagnies"
                  title="Organisation"
                  description="Compagnies, sections et personnels"
                  icon="organization"
                />
              </>
            )}

            {role !== "administrateur" && (
              <>
                <QuickAction
                  to="/admin/creer-missions-4"
                  title="Affectations"
                  description="Poursuivre la préparation des missions"
                  icon="assignment"
                />

                <QuickAction
                  to="/PageAide"
                  title="Aide"
                  description="Consulter l'aide de l'application"
                  icon="help"
                />
              </>
            )}
          </section>
        </div>
      </main>
    </MainLayout>
  );
}

/* ============================================================
   CARTES
============================================================ */

function StatCard({
  title,
  value,
  description,
  icon,
  danger = false,
}) {
  return (
    <div className="group min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p
            className={`mt-2 text-3xl font-bold tracking-tight sm:text-4xl ${
              danger
                ? "text-red-600"
                : "text-slate-900"
            }`}
          >
            {value}
          </p>
        </div>

        <IconBox
          icon={icon}
          danger={danger}
        />
      </div>

      <p className="mt-3 truncate text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
}

function DashboardCard({
  title,
  subtitle,
  children,
}) {
  return (
    <section className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-5">
        <h2 className="text-base font-bold text-slate-900 sm:text-lg">
          {title}
        </h2>

        {subtitle && (
          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            {subtitle}
          </p>
        )}
      </div>

      {children}
    </section>
  );
}

function StatusBadge({ label, tone }) {
  const styles = {
    danger:
      "bg-red-50 text-red-700 ring-red-600/10",
    warning:
      "bg-amber-50 text-amber-700 ring-amber-600/10",
    success:
      "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
  };

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${styles[tone]}`}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

function ProgressRow({
  label,
  value,
  total,
}) {
  const pourcentage =
    total > 0
      ? Math.round((value / total) * 100)
      : 0;

  return (
    <div className="py-3">
      <div className="mb-2 flex items-center justify-between gap-3 text-xs">
        <span className="min-w-0 truncate font-medium text-slate-600">
          {label}
        </span>

        <span className="shrink-0 font-semibold text-slate-900">
          {value}/{total}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-bleu transition-all duration-500"
          style={{
            width: `${pourcentage}%`,
          }}
        />
      </div>

      <p className="mt-1 text-right text-[10px] text-slate-400">
        {pourcentage}%
      </p>
    </div>
  );
}

function QuickAction({
  to,
  title,
  description,
  icon,
}) {
  return (
    <Link
      to={to}
      className="group flex min-h-19 min-w-0 items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
    >
      <IconBox icon={icon} />

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-slate-900 group-hover:text-bleu">
          {title}
        </p>

        <p className="mt-0.5 truncate text-xs text-slate-400">
          {description}
        </p>
      </div>

      <ArrowRightIcon />
    </Link>
  );
}

function IconBox({
  icon,
  danger = false,
}) {
  const iconClass = `h-5 w-5 ${
    danger ? "text-red-600" : "text-bleu"
  }`;

  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
        danger ? "bg-red-50" : "bg-slate-100"
      }`}
    >
      {icon === "mission" && (
        <MissionIcon className={iconClass} />
      )}

      {icon === "vehicle" && (
        <VehicleIcon className={iconClass} />
      )}

      {icon === "user" && (
        <UserIcon className={iconClass} />
      )}

      {icon === "alert" && (
        <AlertIcon className={iconClass} />
      )}

      {icon === "organization" && (
        <OrganizationIcon
          className={iconClass}
        />
      )}

      {icon === "assignment" && (
        <AssignmentIcon
          className={iconClass}
        />
      )}

      {icon === "help" && (
        <HelpIcon className={iconClass} />
      )}
    </div>
  );
}

/* ============================================================
   ICÔNES
============================================================ */

function MissionIcon({
  className = "h-5 w-5",
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 3h12v18H6zM9 7h6M9 11h6M9 15h4"
      />
    </svg>
  );
}

function VehicleIcon({
  className = "h-5 w-5",
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m5 16 1.5-6h11L19 16M4 16h16v3H4zM7 19v1M17 19v1M7 13h10"
      />
    </svg>
  );
}

function UserIcon({
  className = "h-5 w-5",
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
    >
      <circle cx="12" cy="8" r="3" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 20a7 7 0 0 1 14 0"
      />
    </svg>
  );
}

function AlertIcon({
  className = "h-6 w-6",
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v4m0 4h.01M10.29 3.86 2.82 17a2 2 0 0 0 1.74 3h14.88a2 2 0 0 0 1.74-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
      />
    </svg>
  );
}

function OrganizationIcon({
  className = "h-5 w-5",
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
    >
      <rect
        x="4"
        y="4"
        width="6"
        height="6"
        rx="1"
      />

      <rect
        x="14"
        y="4"
        width="6"
        height="6"
        rx="1"
      />

      <rect
        x="9"
        y="14"
        width="6"
        height="6"
        rx="1"
      />

      <path
        strokeLinecap="round"
        d="M7 10v2h10v-2M12 12v2"
      />
    </svg>
  );
}

function AssignmentIcon({
  className = "h-5 w-5",
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 5h6M9 3h6v4H9zM6 5H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1M7 11h10M7 15h7"
      />
    </svg>
  );
}

function HelpIcon({
  className = "h-5 w-5",
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
    >
      <circle cx="12" cy="12" r="9" />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.5 9a2.5 2.5 0 1 1 4.5 1.5c-.7.8-2 1.1-2 2.5M12 17h.01"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4 shrink-0"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 12h14m-6-6 6 6-6 6"
      />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-bleu"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m9 18 6-6-6-6"
      />
    </svg>
  );
}

function EmptyState({ message }) {
  return (
    <div className="flex min-h-40 items-center justify-center rounded-xl bg-slate-50 px-5 text-center">
      <p className="text-sm text-slate-400">
        {message}
      </p>
    </div>
  );
}

export default TableauDeBord;