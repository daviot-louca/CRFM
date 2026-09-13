import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useMission } from "../context/MissionsContextValue";
import { useCompagniesMissions2 } from "../hooks/useCompagniesMissions2";
import useMissionCommandement from "../hooks/useMissionCommandement";
import MainLayout from "@/components/layout/MainLayout";

const getUserId = (user) =>
  typeof user === "object" ? user?.id : user;

const getUserName = (user) =>
  [
    user?.grade,
    user?.firstName,
    user?.lastName,
  ]
    .filter(Boolean)
    .join(" ") ||
  user?.name ||
  `Utilisateur ${user?.id ?? ""}`;

const cardStyle = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "16px",
  boxShadow: "0 4px 18px rgba(15, 23, 42, 0.05)",
};

const selectStyle = {
  boxSizing: "border-box",
  width: "100%",
  minWidth: 0,
  maxWidth: "100%",
  height: "46px",
  padding: "0 12px",
  border: "1px solid #cbd5e1",
  borderRadius: "9px",
  background: "#ffffff",
  color: "#172033",
  fontSize: "16px",
  outline: "none",
};

export default function CreerMissions3Admin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const missionId = searchParams.get("missionId");

  const {
    groupesManuels,
    compagniesSelectionneesIds,
    oalId,
    setOalId,
  } = useMission();

  /*
   * ========================================================
   * COMPAGNIES
   * ========================================================
   */

  const {
    compagnies = [],
    loading: compagniesLoading,
  } = useCompagniesMissions2();

  /*
   * ========================================================
   * COMMANDEMENT
   * ========================================================
   */

  const {
    selectOal,
    saveCommandement,
    loading,
    saving,
    error,
  } = useMissionCommandement(
    missionId,
    groupesManuels,
    compagnies,
  );

  /*
   * ========================================================
   * GROUPES
   * ========================================================
   */

  const groupes = useMemo(
    () =>
      Array.isArray(groupesManuels)
        ? groupesManuels
        : [],
    [groupesManuels],
  );

  /*
   * ========================================================
   * COMPAGNIES DE LA MISSION
   *
   * Sert uniquement au récapitulatif.
   * ========================================================
   */

  const compagniesMission = useMemo(() => {
    const ids = new Set(
      (compagniesSelectionneesIds ?? []).map(String),
    );

    const idsGroupes = new Set(
      groupes
        .map((groupe) => groupe?.compagnieId)
        .filter(Boolean)
        .map(String),
    );

    return compagnies.filter((compagnie) => {
      const compagnieId = String(compagnie.id);

      return (
        ids.has(compagnieId) ||
        idsGroupes.has(compagnieId)
      );
    });
  }, [
    compagnies,
    compagniesSelectionneesIds,
    groupes,
  ]);

  /*
   * ========================================================
   * OAL DISPONIBLES
   *
   * On récupère les OAL de toutes les compagnies.
   * ========================================================
   */

  const oalMission = useMemo(() => {
    const oalMap = new Map();

    compagnies.forEach((compagnie) => {
      const oal =
        compagnie?.oal ??
        compagnie?.OAL ??
        null;

      if (!oal?.id) {
        return;
      }

      oalMap.set(
        String(oal.id),
        oal,
      );
    });

    return Array.from(
      oalMap.values(),
    );
  }, [compagnies]);

  /*
   * ========================================================
   * VALIDATION
   *
   * À cette étape, seul l'OAL est obligatoire.
   * Le SOA sera désigné plus tard.
   * ========================================================
   */

  const commandementComplet =
    Boolean(oalId);

  /*
   * ========================================================
   * CONTINUER
   * ========================================================
   */

  const handleContinuer = async () => {
    if (!missionId) {
      alert(
        "Aucune mission sélectionnée.",
      );

      return;
    }

    if (!oalId) {
      alert(
        "Veuillez sélectionner l'OAL responsable de la mission.",
      );

      return;
    }

    try {
      await saveCommandement();

      navigate(
        `/admin/creer-missions-4?missionId=${missionId}`,
      );
    } catch (err) {
      console.error(
        "Erreur sauvegarde commandement :",
        err,
      );
    }
  };

  /*
   * ========================================================
   * CHARGEMENT
   * ========================================================
   */

  if (
    loading ||
    compagniesLoading
  ) {
    return (
      <MainLayout>
        <div className="flex min-h-[50vh] items-center justify-center bg-slate-50 px-4">
          <p className="text-sm font-semibold text-slate-600">
            Chargement du commandement...
          </p>
        </div>
      </MainLayout>
    );
  }

  /*
   * ========================================================
   * RENDER
   * ========================================================
   */

  return (
    <MainLayout>
      <div className="min-h-screen w-full min-w-0 bg-slate-50 px-4 pb-10 pt-4 text-slate-900 sm:px-6 sm:pb-12 sm:pt-6 lg:px-8">
        <div className="mx-auto w-full min-w-0 max-w-7xl">

          {/* ==================================================
              TIMELINE
          ================================================== */}

          <div className="mb-5 w-full min-w-0 overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm sm:mb-8">
            <div className="flex min-w-155 items-start px-3 py-4 sm:mx-auto sm:min-w-0 sm:max-w-5xl sm:px-5 sm:py-5">

              {/* Étape 1 */}
              <div className="flex min-w-0 shrink-0 flex-1 flex-col items-center">
                <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-green-600 bg-green-50 text-xs font-bold text-green-700 sm:h-8 sm:w-8 sm:text-sm">
                  ✓
                </div>

                <span className="mt-1.5 max-w-20 text-center text-[9px] font-semibold leading-tight text-green-700 sm:mt-2 sm:max-w-none sm:text-xs">
                  Infos
                </span>
              </div>

              <div className="mt-3 h-0.5 min-w-4 flex-1 bg-green-300 sm:mt-4 sm:min-w-6" />

              {/* Étape 2 - ACTIVE */}
              <div className="flex min-w-0 shrink-0 flex-1 flex-col items-center">
                <div className="flex h-7 w-7 items-center justify-center rounded-full border-2  border-green-600 bg-green-50 text-xs font-bold text-green-700 shadow-sm sm:h-8 sm:w-8 sm:text-sm">
                ✓
                </div>

                <span className="mt-1.5 max-w-24 text-center text-[9px] font-bold leading-tight text-green-700 sm:mt-2 sm:max-w-none sm:text-xs">
                  Affectations des compagnies
                </span>
              </div>

              <div className="mt-3 h-0.5 min-w-4 flex-1 bg-green-300 sm:mt-4 sm:min-w-6" />

              {/* Étape 3 */}
              <div className="flex min-w-0 shrink-0 flex-1 flex-col items-center">
                <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-blue-600 bg-blue-600 text-xs font-bold text-white sm:h-8 sm:w-8 sm:text-sm">
                  3
                </div>

                <span className="mt-1.5 max-w-24 text-center text-[9px] font-semibold leading-tight text-blue-700 sm:mt-2 sm:max-w-none sm:text-xs">
                  Désignation de l'OAL
                </span>
              </div>

              <div className="mt-3 h-0.5 min-w-4 flex-1 bg-gray-200 sm:mt-4 sm:min-w-6" />

              {/* Étape 4 */}
              <div className="flex min-w-0 shrink-0 flex-1 flex-col items-center">
                <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-gray-300 bg-gray-50 text-xs font-bold text-gray-400 sm:h-8 sm:w-8 sm:text-sm">
                  4
                </div>

                <span className="mt-1.5 max-w-20 text-center text-[9px] font-semibold leading-tight text-gray-400 sm:mt-2 sm:max-w-none sm:text-xs">
                  Véhicules
                </span>
              </div>

              <div className="mt-3 h-0.5 min-w-4 flex-1 bg-gray-200 sm:mt-4 sm:min-w-6" />

              {/* Étape 5 */}
              <div className="flex min-w-0 shrink-0 flex-1 flex-col items-center">
                <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-gray-300 bg-gray-50 text-xs font-bold text-gray-400 sm:h-8 sm:w-8 sm:text-sm">
                  5
                </div>

                <span className="mt-1.5 max-w-24 text-center text-[9px] font-semibold leading-tight text-gray-400 sm:mt-2 sm:max-w-none sm:text-xs">
                  Désignation du ou des SOA
                </span>
              </div>

              <div className="mt-3 h-0.5 min-w-4 flex-1 bg-gray-200 sm:mt-4 sm:min-w-6" />

              {/* Étape 6 */}
              <div className="flex min-w-0 shrink-0 flex-1 flex-col items-center">
                <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-gray-300 bg-gray-50 text-xs font-bold text-gray-400 sm:h-8 sm:w-8 sm:text-sm">
                  6
                </div>

                <span className="mt-1.5 max-w-20 text-center text-[9px] font-semibold leading-tight text-gray-400 sm:mt-2 sm:max-w-none sm:text-xs">
                  Conducteurs
                </span>
              </div>

            </div>
          </div>

          {/* ==================================================
              OAL
          ================================================== */}

          <section
            style={{
              ...cardStyle,
              padding: "20px 16px",
              marginBottom: "16px",
            }}
            className="sm:p-7"
          >
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
                Étape 3
              </p>

              <h1 className="mt-1 text-xl font-extrabold text-slate-900 sm:text-2xl">
                Désignation de l'OAL
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
                Sélectionnez l'OAL responsable de
                la mission. La désignation des SOA
                sera effectuée lors d'une étape
                ultérieure.
              </p>
            </div>

            <div className="max-w-2xl">
              <label
                htmlFor="mission-oal"
                className="mb-2 block text-xs font-bold text-slate-700 sm:text-sm"
              >
                OAL responsable{" "}
                <span className="text-red-600">
                  *
                </span>
              </label>

              <select
                id="mission-oal"
                value={oalId ?? ""}
                onChange={(event) => {
                  const value =
                    event.target.value ||
                    null;

                  setOalId(value);
                  selectOal(value);
                }}
                disabled={
                  saving ||
                  oalMission.length === 0
                }
                style={{
                  ...selectStyle,
                  opacity:
                    saving ||
                      oalMission.length === 0
                      ? 0.6
                      : 1,
                }}
              >
                <option value="">
                  Sélectionner un OAL
                </option>

                {oalMission.map((oal) => (
                  <option
                    key={getUserId(oal)}
                    value={getUserId(oal)}
                  >
                    {getUserName(oal)}
                  </option>
                ))}
              </select>

              {oalMission.length === 0 && (
                <div className="mt-3 rounded-xl border border-orange-200 bg-orange-50 p-3 text-xs leading-relaxed text-orange-800 sm:text-sm">
                  Aucun OAL n'est associé aux
                  compagnies disponibles.
                </div>
              )}
            </div>
          </section>

          {/* ==================================================
              GROUPES
          ================================================== */}

          <section
            style={{
              ...cardStyle,
              padding: "20px 16px",
              marginBottom: "16px",
            }}
            className="sm:p-7"
          >
            <div className="mb-5">
              <h2 className="text-base font-extrabold text-slate-900 sm:text-lg">
                Groupes de la mission
              </h2>

              <p className="mt-1 text-xs leading-relaxed text-slate-500 sm:text-sm">
                Les groupes affectés à la mission
                sont récapitulés ci-dessous.
                Les SOA seront désignés lors de
                l'étape dédiée au commandement.
              </p>
            </div>

            {groupes.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-xs leading-relaxed text-slate-500 sm:text-sm">
                Aucun groupe n'est disponible
                pour cette mission.
              </div>
            ) : (
              <div className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-2">
                {groupes.map(
                  (groupe, index) => (
                    <div
                      key={
                        groupe?.id ??
                        `groupe-${index}`
                      }
                      className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"
                    >
                      <div className="mb-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        Groupe {index + 1}
                      </div>

                      <h3 className="wrap-break-words text-base font-extrabold text-slate-900">
                        {groupe?.nom ??
                          groupe?.nomGroupe ??
                          `Groupe ${index + 1
                          }`}
                      </h3>

                      <div className="mt-3 flex min-w-0 flex-wrap gap-2">
                        {groupe?.compagnieId && (
                          <span className="max-w-full break-all rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] text-slate-500">
                            Compagnie #
                            {
                              groupe.compagnieId
                            }
                          </span>
                        )}

                        {groupe?.sectionId && (
                          <span className="max-w-full break-all rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] text-slate-500">
                            Section #
                            {
                              groupe.sectionId
                            }
                          </span>
                        )}
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </section>

          {/* ==================================================
              RÉCAPITULATIF
          ================================================== */}

          <section
            style={{
              ...cardStyle,
              padding: "16px",
              marginBottom: "16px",
              background: "#f8fafc",
            }}
            className="sm:p-5"
          >
            <h3 className="mb-3 text-sm font-extrabold sm:text-base">
              Récapitulatif
            </h3>

            <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-3">

              {/* OAL */}

              <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-3">
                <div className="text-[10px] text-slate-500">
                  OAL
                </div>

                <strong
                  className={`mt-1 block wrap-break-words text-sm ${oalId
                      ? "text-green-700"
                      : "text-slate-400"
                    }`}
                >
                  {oalId
                    ? "Sélectionné"
                    : "À sélectionner"}
                </strong>
              </div>

              {/* COMPAGNIES */}

              <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-3">
                <div className="text-[10px] text-slate-500">
                  Compagnies
                </div>

                <strong className="mt-1 block text-lg">
                  {compagniesMission.length}
                </strong>
              </div>

              {/* GROUPES */}

              <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-3">
                <div className="text-[10px] text-slate-500">
                  Groupes
                </div>

                <strong className="mt-1 block text-lg">
                  {groupes.length}
                </strong>
              </div>

            </div>
          </section>

          {/* ==================================================
              ERREUR
          ================================================== */}

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs leading-relaxed text-red-700 sm:p-4 sm:text-sm">
              {error}
            </div>
          )}

          {/* ==================================================
              NAVIGATION
          ================================================== */}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">

            <button
              type="button"
              onClick={() =>
                navigate(
                  `/admin/creer-missions-2?missionId=${missionId}`,
                )
              }
              disabled={saving}
              className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-0 sm:w-auto sm:px-5 sm:py-2.5"
            >
              ← Étape précédente
            </button>

            <button
              type="button"
              onClick={handleContinuer}
              disabled={
                saving ||
                !commandementComplet
              }
              className="min-h-11 w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 sm:min-h-0 sm:w-auto sm:py-2.5"
            >
              {saving
                ? "Enregistrement..."
                : "Continuer vers les véhicules →"}
            </button>

          </div>
        </div>
      </div>
    </MainLayout>
  );
}
