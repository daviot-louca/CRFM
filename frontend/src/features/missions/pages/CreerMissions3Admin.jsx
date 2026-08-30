import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useMission } from "../context/MissionsContextValue";
import { useCompagniesMissions2 } from "../hooks/useCompagniesMissions2";
import useMissionCommandement from "../hooks/useMissionCommandement";

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
  width: "100%",
  height: "46px",
  padding: "0 12px",
  border: "1px solid #cbd5e1",
  borderRadius: "9px",
  background: "#ffffff",
  color: "#172033",
  fontSize: "14px",
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
   * IMPORTANT :
   * On prend les OA de TOUTES les compagnies.
   *
   * Exemple :
   * 18 compagnies dans l'organisation
   * => jusqu'à 18 OA dans la liste.
   *
   * Ce n'est PAS limité aux compagnies de la mission.
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
   *
   * IMPORTANT :
   * soaMission vient du hook.
   *
   * Elle contient TOUS les SOA affectés à la mission.
   *
   * On ne filtre PAS par groupe.
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
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8fafc",
          color: "#475569",
          fontSize: "15px",
          fontWeight: 600,
        }}
      >
        Chargement du commandement...
      </div>
    );
  }

  /*
   * ========================================================
   * RENDER
   * ========================================================
   */

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "32px 20px 50px",
        color: "#172033",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        {/* ==================================================
            HEADER
        ================================================== */}

        <div
          style={{
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: 800,
              color: "#2563eb",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "8px",
            }}
          >
            Création de mission · Étape 3 sur 5
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "30px",
              lineHeight: 1.2,
              fontWeight: 800,
            }}
          >
            Commandement de la mission
          </h1>

          <p
            style={{
              margin: "9px 0 0",
              color: "#64748b",
              fontSize: "14px",
            }}
          >
            Choisissez l'OA de la mission puis
            le SOA responsable de chaque groupe.
          </p>
        </div>

        {/* ==================================================
            PROGRESSION
        ================================================== */}

        <div
          style={{
            ...cardStyle,
            padding: "18px 20px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(5, 1fr)",
              gap: "8px",
            }}
          >
            {[
              [1, "Informations"],
              [2, "Affectations"],
              [3, "Commandement"],
              [4, "Véhicules"],
              [5, "Conducteurs"],
            ].map(([step, label]) => (
              <div
                key={step}
                style={{
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: "34px",
                    height: "34px",
                    margin:
                      "0 auto 7px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "13px",
                    fontWeight: 800,

                    background:
                      step < 3
                        ? "#dcfce7"
                        : step === 3
                          ? "#2563eb"
                          : "#f8fafc",

                    color:
                      step < 3
                        ? "#15803d"
                        : step === 3
                          ? "#ffffff"
                          : "#94a3b8",

                    border:
                      step === 3
                        ? "2px solid #2563eb"
                        : "2px solid #e2e8f0",
                  }}
                >
                  {step < 3
                    ? "✓"
                    : step}
                </div>

                <div
                  style={{
                    fontSize: "11px",
                    fontWeight:
                      step === 3
                        ? 800
                        : 600,
                    color:
                      step === 3
                        ? "#2563eb"
                        : "#64748b",
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ==================================================
            OA
        ================================================== */}

        <section
          style={{
            ...cardStyle,
            padding: "28px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems:
                "flex-start",
              gap: "24px",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                flex: "1 1 600px",
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  padding: "5px 9px",
                  borderRadius: "999px",
                  background: "#eff6ff",
                  color: "#2563eb",
                  fontSize: "11px",
                  fontWeight: 800,
                  marginBottom: "11px",
                }}
              >
                01 · OA
              </div>

              <h2
                style={{
                  margin: 0,
                  fontSize: "20px",
                  fontWeight: 800,
                }}
              >
                Officier d'Action de la mission
              </h2>

              <p
                style={{
                  margin: "9px 0 18px",
                  color: "#64748b",
                  fontSize: "13px",
                  lineHeight: 1.6,
                }}
              >
                Sélectionnez l'OA responsable
                de la mission parmi les OA de
                toutes les compagnies.
              </p>

              <label
                htmlFor="mission-oa"
                style={{
                  display: "block",
                  marginBottom: "7px",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#334155",
                }}
              >
                OA responsable{" "}
                <span
                  style={{
                    color: "#dc2626",
                  }}
                >
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
                  maxWidth: "680px",
                }}
              >
                <option value="">
                  Sélectionner un OA
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

              {oaMission.length === 0 && (
                <div
                  style={{
                    marginTop: "10px",
                    padding: "11px 13px",
                    borderRadius: "9px",
                    background: "#fff7ed",
                    border:
                      "1px solid #fed7aa",
                    color: "#9a3412",
                    fontSize: "13px",
                  }}
                >
                  Aucun OA n'est associé
                  aux compagnies disponibles.
                </div>
              )}
            </div>

            <div
              style={{
                width: "260px",
                padding: "17px",
                borderRadius: "12px",
                background: "#f8fafc",
                border:
                  "1px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 800,
                  marginBottom: "7px",
                }}
              >
                OA disponibles
              </div>

              <div
                style={{
                  fontSize: "24px",
                  fontWeight: 800,
                  color: "#2563eb",
                }}
              >
                {oaMission.length}
              </div>

              <div
                style={{
                  marginTop: "3px",
                  fontSize: "12px",
                  color: "#64748b",
                }}
              >
                OA disponibles parmi toutes
                les compagnies.
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================
            SOA
        ================================================== */}

        <section
          style={{
            ...cardStyle,
            padding: "28px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems:
                "flex-end",
              gap: "16px",
              marginBottom: "20px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-block",
                  padding: "5px 9px",
                  borderRadius: "999px",
                  background: "#f1f5f9",
                  color: "#475569",
                  fontSize: "11px",
                  fontWeight: 800,
                  marginBottom: "11px",
                }}
              >
                02 · SOA
              </div>

              <h2
                style={{
                  margin: 0,
                  fontSize: "20px",
                  fontWeight: 800,
                }}
              >
                Sous-Officier d'Action par groupe
              </h2>

              <p
                style={{
                  margin: "8px 0 0",
                  color: "#64748b",
                  fontSize: "13px",
                }}
              >
                Chaque groupe doit avoir son
                SOA responsable. Tous les SOA
                affectés à la mission sont
                disponibles.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: "8px",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: "999px",
                  background: "#f8fafc",
                  border:
                    "1px solid #e2e8f0",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#475569",
                }}
              >
                {soaMission.length} SOA disponibles
              </div>

              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: "999px",
                  background: "#f8fafc",
                  border:
                    "1px solid #e2e8f0",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#475569",
                }}
              >
                {nombreSoaRenseignes}/
                {groupes.length} SOA renseignés
              </div>
            </div>
          </div>

          {groupes.length === 0 ? (
            <div
              style={{
                padding: "24px",
                borderRadius: "11px",
                border:
                  "1px dashed #cbd5e1",
                background: "#f8fafc",
                textAlign: "center",
                color: "#64748b",
                fontSize: "13px",
              }}
            >
              Aucun groupe n'est disponible
              pour cette mission.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "15px",
              }}
            >
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
                      style={{
                        padding: "19px",
                        borderRadius: "13px",
                        border:
                          "1px solid #e2e8f0",
                        background:
                          "#ffffff",
                      }}
                    >
                      {/* GROUPE */}

                      <div
                        style={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                          alignItems:
                            "flex-start",
                          gap: "10px",
                          marginBottom:
                            "14px",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize:
                                "10px",
                              fontWeight:
                                800,
                              color:
                                "#94a3b8",
                              textTransform:
                                "uppercase",
                              marginBottom:
                                "4px",
                            }}
                          >
                            Groupe{" "}
                            {index + 1}
                          </div>

                          <h3
                            style={{
                              margin: 0,
                              fontSize:
                                "16px",
                              fontWeight:
                                800,
                            }}
                          >
                            {groupe?.nom ??
                              groupe?.nomGroupe ??
                              `Groupe ${
                                index + 1
                              }`}
                          </h3>
                        </div>

                        <div
                          style={{
                            padding:
                              "5px 8px",
                            borderRadius:
                              "999px",
                            background:
                              soaMission.length >
                              0
                                ? "#eff6ff"
                                : "#fff7ed",
                            color:
                              soaMission.length >
                              0
                                ? "#2563eb"
                                : "#9a3412",
                            fontSize:
                              "10px",
                            fontWeight:
                              800,
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          {soaMission.length}{" "}
                          disponible
                          {soaMission.length >
                          1
                            ? "s"
                            : ""}
                        </div>
                      </div>

                      {/* INFORMATIONS */}

                      <div
                        style={{
                          display: "flex",
                          flexWrap:
                            "wrap",
                          gap: "7px",
                          marginBottom:
                            "16px",
                        }}
                      >
                        {groupe?.compagnieId && (
                          <span
                            style={{
                              padding:
                                "4px 7px",
                              borderRadius:
                                "6px",
                              background:
                                "#f8fafc",
                              border:
                                "1px solid #e2e8f0",
                              color:
                                "#64748b",
                              fontSize:
                                "10px",
                            }}
                          >
                            Compagnie #
                            {
                              groupe.compagnieId
                            }
                          </span>
                        )}

                        {groupe?.sectionId && (
                          <span
                            style={{
                              padding:
                                "4px 7px",
                              borderRadius:
                                "6px",
                              background:
                                "#f8fafc",
                              border:
                                "1px solid #e2e8f0",
                              color:
                                "#64748b",
                              fontSize:
                                "10px",
                            }}
                          >
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
                            style={{
                              display:
                                "block",
                              marginBottom:
                                "7px",
                              fontSize:
                                "12px",
                              fontWeight:
                                700,
                              color:
                                "#334155",
                            }}
                          >
                            SOA responsable{" "}
                            <span
                              style={{
                                color:
                                  "#dc2626",
                              }}
                            >
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
                            style={
                              selectStyle
                            }
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
                            <div
                              style={{
                                marginTop:
                                  "8px",
                                fontSize:
                                  "11px",
                                fontWeight:
                                  700,
                                color:
                                  "#15803d",
                              }}
                            >
                              ✓ SOA sélectionné
                            </div>
                          )}
                        </>
                      ) : (
                        <div
                          style={{
                            padding:
                              "12px",
                            borderRadius:
                              "9px",
                            background:
                              "#fff7ed",
                            border:
                              "1px solid #fed7aa",
                            color:
                              "#9a3412",
                            fontSize:
                              "12px",
                            lineHeight:
                              1.5,
                          }}
                        >
                          Aucun SOA affecté à
                          cette mission n'est
                          disponible.
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
            padding: "22px 28px",
            marginBottom: "20px",
            background: "#f8fafc",
          }}
        >
          <h3
            style={{
              margin: "0 0 14px",
              fontSize: "15px",
              fontWeight: 800,
            }}
          >
            Récapitulatif
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(170px, 1fr))",
              gap: "10px",
            }}
          >
            {/* OA */}

            <div
              style={{
                background: "#ffffff",
                border:
                  "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "13px",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  color: "#64748b",
                }}
              >
                OA
              </div>

              <strong
                style={{
                  display: "block",
                  marginTop: "4px",
                  color: oaId
                    ? "#15803d"
                    : "#94a3b8",
                  fontSize: "14px",
                }}
              >
                {oaId
                  ? "Sélectionné"
                  : "À sélectionner"}
              </strong>
            </div>

            {/* COMPAGNIES */}

            <div
              style={{
                background: "#ffffff",
                border:
                  "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "13px",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  color: "#64748b",
                }}
              >
                Compagnies
              </div>

              <strong
                style={{
                  display: "block",
                  marginTop: "4px",
                  fontSize: "19px",
                }}
              >
                {compagniesMission.length}
              </strong>
            </div>

            {/* GROUPES */}

            <div
              style={{
                background: "#ffffff",
                border:
                  "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "13px",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  color: "#64748b",
                }}
              >
                Groupes
              </div>

              <strong
                style={{
                  display: "block",
                  marginTop: "4px",
                  fontSize: "19px",
                }}
              >
                {groupes.length}
              </strong>
            </div>

            {/* SOA */}

            <div
              style={{
                background: "#ffffff",
                border:
                  "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "13px",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  color: "#64748b",
                }}
              >
                SOA renseignés
              </div>

              <strong
                style={{
                  display: "block",
                  marginTop: "4px",
                  fontSize: "19px",
                  color:
                    nombreSoaRenseignes ===
                      groupes.length &&
                    groupes.length > 0
                      ? "#15803d"
                      : "#172033",
                }}
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
          <div
            style={{
              marginBottom: "20px",
              padding: "13px 15px",
              borderRadius: "10px",
              background: "#fef2f2",
              border:
                "1px solid #fecaca",
              color: "#b91c1c",
              fontSize: "13px",
            }}
          >
            {error}
          </div>
        )}

        {/* ==================================================
            NAVIGATION
        ================================================== */}

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={() =>
              navigate(
                `/admin/creer-missions-2?missionId=${missionId}`,
              )
            }
            disabled={saving}
            style={{
              height: "46px",
              padding: "0 18px",
              borderRadius: "9px",
              border:
                "1px solid #cbd5e1",
              background: "#ffffff",
              color: "#334155",
              fontWeight: 700,
              cursor: saving
                ? "not-allowed"
                : "pointer",
            }}
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
            style={{
              height: "46px",
              padding: "0 22px",
              borderRadius: "9px",
              border: "none",
              background:
                saving ||
                !commandementComplet
                  ? "#cbd5e1"
                  : "#2563eb",
              color: "#ffffff",
              fontWeight: 800,
              cursor:
                saving ||
                !commandementComplet
                  ? "not-allowed"
                  : "pointer",
              boxShadow:
                saving ||
                !commandementComplet
                  ? "none"
                  : "0 5px 14px rgba(37, 99, 235, 0.18)",
            }}
          >
            {saving
              ? "Enregistrement..."
              : "Continuer vers les véhicules →"}
          </button>
        </div>
      </div>
    </div>
  );
}