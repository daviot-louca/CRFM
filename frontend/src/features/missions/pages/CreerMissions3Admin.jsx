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

  /*
   * 16px minimum sur mobile :
   * évite le zoom automatique de Safari iOS.
   */
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
    oaId,
    setOaId,
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
    groupesCommandement = [],
    soaMission = [],
    selectOa,
    selectSoa,
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
   * Cette liste sert uniquement au récapitulatif.
   * Elle ne sert PAS à limiter les OA.
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
   * OA DISPONIBLES
   *
   * On prend les OA de TOUTES les compagnies.
   * ========================================================
   */

  const oaMission = useMemo(() => {
    const oaMap = new Map();

    compagnies.forEach((compagnie) => {
      const oa =
        compagnie?.oa ??
        compagnie?.OA ??
        null;

      if (!oa?.id) {
        return;
      }

      oaMap.set(
        String(oa.id),
        oa,
      );
    });

    return Array.from(
      oaMap.values(),
    );
  }, [compagnies]);

  /*
   * ========================================================
   * SOA
   * ========================================================
   */

  const soaDisponibles = soaMission;

  /*
   * ========================================================
   * SOA ACTUEL DU GROUPE
   * ========================================================
   */

  const getSoaSelectionne = (groupeId) => {
    const groupe =
      groupesCommandement.find(
        (item) =>
          String(item?.groupeId) ===
          String(groupeId),
      );

    return groupe?.soaId ?? "";
  };

  /*
   * ========================================================
   * VALIDATION
   * ========================================================
   */

  const nombreSoaRenseignes =
    groupes.filter((groupe) =>
      Boolean(
        getSoaSelectionne(
          groupe?.id,
        ),
      ),
    ).length;

  const commandementComplet =
    Boolean(oaId) &&
    groupes.length > 0 &&
    soaMission.length > 0 &&
    groupes.every((groupe) =>
      Boolean(
        getSoaSelectionne(
          groupe?.id,
        ),
      ),
    );

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

    if (!oaId) {
      alert(
        "Veuillez sélectionner l'OA responsable de la mission.",
      );

      return;
    }

    if (groupes.length === 0) {
      alert(
        "Aucun groupe n'est disponible pour cette mission.",
      );

      return;
    }

    if (soaMission.length === 0) {
      alert(
        "Aucun SOA affecté à cette mission n'est disponible.",
      );

      return;
    }

    const groupeIncomplet =
      groupes.find((groupe) => {
        const soaSelectionne =
          getSoaSelectionne(
            groupe?.id,
          );

        return !soaSelectionne;
      });

    if (groupeIncomplet) {
      alert(
        "Veuillez sélectionner un SOA pour chaque groupe avant de continuer.",
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

          <div
            style={{
              ...cardStyle,
              padding: "12px 10px",
              marginBottom: "20px",
              overflowX: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                minWidth: "560px",
                width: "100%",
                maxWidth: "1000px",
                margin: "0 auto",
              }}
            >
              {/* ÉTAPE 1 */}

              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    margin: "0 auto 5px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#dcfce7",
                    color: "#15803d",
                    border: "2px solid #86efac",
                    fontSize: "11px",
                    fontWeight: 800,
                  }}
                >
                  ✓
                </div>

                <div
                  style={{
                    fontSize: "9px",
                    lineHeight: 1.2,
                    fontWeight: 700,
                    color: "#15803d",
                  }}
                >
                  Infos
                </div>
              </div>

              <div
                style={{
                  flex: 1,
                  height: "2px",
                  marginTop: "15px",
                  background: "#86efac",
                }}
              />

              {/* ÉTAPE 2 */}

              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    margin: "0 auto 5px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#dcfce7",
                    color: "#15803d",
                    border: "2px solid #86efac",
                    fontSize: "11px",
                    fontWeight: 800,
                  }}
                >
                  ✓
                </div>

                <div
                  style={{
                    fontSize: "9px",
                    lineHeight: 1.2,
                    fontWeight: 700,
                    color: "#15803d",
                  }}
                >
                  Affectations
                  <br />
                  des compagnies
                </div>
              </div>

              <div
                style={{
                  flex: 1,
                  height: "2px",
                  marginTop: "15px",
                  background: "#2563eb",
                }}
              />

              {/* ÉTAPE 3 */}

              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    margin: "0 auto 5px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#2563eb",
                    color: "#ffffff",
                    border: "2px solid #2563eb",
                    fontSize: "11px",
                    fontWeight: 800,
                  }}
                >
                  3
                </div>

                <div
                  style={{
                    fontSize: "9px",
                    lineHeight: 1.2,
                    fontWeight: 800,
                    color: "#2563eb",
                  }}
                >
                  Désignation du
                  <br />
                  OAL et du SOA
                </div>
              </div>

              <div
                style={{
                  flex: 1,
                  height: "2px",
                  marginTop: "15px",
                  background: "#e2e8f0",
                }}
              />

              {/* ÉTAPE 4 */}

              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    margin: "0 auto 5px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#f8fafc",
                    color: "#94a3b8",
                    border: "2px solid #e2e8f0",
                    fontSize: "11px",
                    fontWeight: 800,
                  }}
                >
                  4
                </div>

                <div
                  style={{
                    fontSize: "9px",
                    lineHeight: 1.2,
                    fontWeight: 600,
                    color: "#64748b",
                  }}
                >
                  Véhicules
                </div>
              </div>

              <div
                style={{
                  flex: 1,
                  height: "2px",
                  marginTop: "15px",
                  background: "#e2e8f0",
                }}
              />

              {/* ÉTAPE 5 */}

              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    margin: "0 auto 5px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#f8fafc",
                    color: "#94a3b8",
                    border: "2px solid #e2e8f0",
                    fontSize: "11px",
                    fontWeight: 800,
                  }}
                >
                  5
                </div>

                <div
                  style={{
                    fontSize: "9px",
                    lineHeight: 1.2,
                    fontWeight: 600,
                    color: "#64748b",
                  }}
                >
                  Conducteurs
                </div>
              </div>
            </div>
          </div>

          {/* ==================================================
              OA
          ================================================== */}

          <section
            style={{
              ...cardStyle,
              padding: "10px 16px",
              marginBottom: "16px",
            }}
            className="sm:p-7"
          >
            <div className="flex min-w-0 flex-col lg:flex-row lg:items-start lg:justify-between lg:gap-8">

                <div className="min-w-0 max-w-2xl">
                  <label
                    htmlFor="mission-oa"
                    className="mb-2 block text-xs font-bold text-slate-700 sm:text-sm"
                  >
                    OAL responsable{" "}
                    <span className="text-red-600">
                      *
                    </span>
                  </label>

                  <select
                    id="mission-oa"
                    value={oaId ?? ""}
                    onChange={(event) => {
                      const value =
                        event.target.value ||
                        null;

                      setOaId(value);
                      selectOa(value);
                    }}
                    disabled={
                      saving ||
                      oaMission.length === 0
                    }
                    style={{
                      ...selectStyle,
                      opacity:
                        saving ||
                        oaMission.length === 0
                          ? 0.6
                          : 1,
                    }}
                  >
                    <option value="">
                      Sélectionner un OAL
                    </option>

                    {oaMission.map((oa) => (
                      <option
                        key={oa.id}
                        value={oa.id}
                      >
                        {getUserName(oa)}
                      </option>
                    ))}
                  </select>
                </div>

                {oaMission.length === 0 && (
                  <div className="mt-3 rounded-xl border border-orange-200 bg-orange-50 p-3 text-xs leading-relaxed text-orange-800 sm:text-sm">
                    Aucun OAL n'est associé aux
                    compagnies disponibles.
                  </div>
                )}
              </div>
          </section>

          {/* ==================================================
              SOA
          ================================================== */}

          <section
            style={{
              ...cardStyle,
              padding: "20px 16px",
              marginBottom: "16px",
            }}
            className="sm:p-7"
          >


            {groupes.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-xs leading-relaxed text-slate-500 sm:text-sm">
                Aucun groupe n'est disponible
                pour cette mission.
              </div>
            ) : (
              <div className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-2">
                {groupes.map(
                  (groupe, index) => {
                    const groupeId =
                      groupe?.id;

                    const soaSelectionne =
                      getSoaSelectionne(
                        groupeId,
                      );

                    return (
                      <div
                        key={
                          groupeId ??
                          `groupe-${index}`
                        }
                        className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"
                      >
                        {/* GROUPE */}

                        <div className="mb-4 flex min-w-0 items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="mb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                              Groupe {index + 1}
                            </div>

                            <h3 className="wrap-break-words text-base font-extrabold text-slate-900">
                              {groupe?.nom ??
                                groupe?.nomGroupe ??
                                `Groupe ${
                                  index + 1
                                }`}
                            </h3>
                          </div>

                          <div className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-extrabold text-blue-600">
                            {soaMission.length} SOA
                          </div>
                        </div>

                        {/* INFORMATIONS */}

                        <div className="mb-4 flex min-w-0 flex-wrap gap-2">
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

                        {/* SELECT SOA */}

                        {soaDisponibles.length >
                        0 ? (
                          <>
                            <label
                              htmlFor={`soa-${groupeId ?? index}`}
                              className="mb-2 block text-xs font-bold text-slate-700 sm:text-sm"
                            >
                              SOA responsable{" "}
                              <span className="text-red-600">
                                *
                              </span>
                            </label>

                            <select
                              id={`soa-${groupeId ?? index}`}
                              value={
                                soaSelectionne
                              }
                              onChange={(
                                event,
                              ) =>
                                selectSoa(
                                  groupeId,
                                  event
                                    .target
                                    .value ||
                                    null,
                                )
                              }
                              disabled={
                                saving
                              }
                              style={{
                                ...selectStyle,
                                opacity:
                                  saving
                                    ? 0.6
                                    : 1,
                              }}
                            >
                              <option value="">
                                Sélectionner un SOA
                              </option>

                              {soaDisponibles.map(
                                (soa) => (
                                  <option
                                    key={getUserId(
                                      soa,
                                    )}
                                    value={getUserId(
                                      soa,
                                    )}
                                  >
                                    {getUserName(
                                      soa,
                                    )}
                                  </option>
                                ),
                              )}
                            </select>

                            {soaSelectionne && (
                              <div className="mt-2 text-[11px] font-bold text-green-700">
                                ✓ SOA sélectionné
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="rounded-xl border border-orange-200 bg-orange-50 p-3 text-xs leading-relaxed text-orange-800">
                            Aucun SOA affecté à cette
                            mission n'est disponible.
                          </div>
                        )}
                      </div>
                    );
                  },
                )}
              </div>
            )}
          </section>

          {/* ==================================================
              RECAPITULATIF
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

            <div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-4">
              {/* OAL */}

              <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-3">
                <div className="text-[10px] text-slate-500">
                  OAL
                </div>

                <strong
                  className={`mt-1 block wrap-break-words text-sm ${
                    oaId
                      ? "text-green-700"
                      : "text-slate-400"
                  }`}
                >
                  {oaId
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

              {/* SOA */}

              <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-3">
                <div className="text-[10px] text-slate-500">
                  SOA renseignés
                </div>

                <strong
                  className={`mt-1 block text-lg ${
                    nombreSoaRenseignes ===
                      groupes.length &&
                    groupes.length > 0
                      ? "text-green-700"
                      : "text-slate-900"
                  }`}
                >
                  {nombreSoaRenseignes}/
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