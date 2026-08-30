import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";

import { useMissions2 } from "../hooks/useMissions2";
import {
  updateMissionConducteurs,
} from "../api/missions.api";

function CreerMissions5Admin() {
  const navigate = useNavigate();

  const {
    missionId,
    groupes = [],
    groupesManuels = [],
    usersDisponibles = [],
    vehiculesSelectionnes = [],
    vehiculesSelectionnesComplets = [],
    setConducteurVehicule,
  } = useMissions2();
  console.log(
    "[ÉTAPE 5] CONTEXTE USERS MISSION :",
    useMissions2()?.usersMission
  );

  const groupesAAfficher =
    groupes.length > 0 ? groupes : groupesManuels;

  const extractUser = (item) => {
    if (!item) {
      return null;
    }

    if (
      typeof item === "object" &&
      item.user
    ) {
      return item.user;
    }

    if (
      typeof item === "object" &&
      item.utilisateur
    ) {
      return item.utilisateur;
    }

    if (
      typeof item === "object" &&
      item.User
    ) {
      return item.User;
    }

    return item;
  };

  const conducteursMission = useMemo(() => {
    const utilisateurs = Array.isArray(usersDisponibles)
      ? usersDisponibles
          .map(extractUser)
          .filter(Boolean)
      : [];

    const conducteurs = utilisateurs.filter((user) => {
      const roleName = String(
        user?.role?.roleName ?? ""
      )
        .trim()
        .toUpperCase();

      return (
        roleName === "CONDUCTEUR" ||
        roleName === "SOA" ||
        roleName === "OA"
      );
    });

    return Array.from(
      new Map(
        conducteurs.map((user) => [
          String(user.id),
          user,
        ])
      ).values()
    );
  }, [usersDisponibles]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  /*
   * ============================================================
   * TIMELINE
   * ============================================================
   */

  const etapes = [
    {
      numero: 1,
      titre: "Mission",
      active: false,
    },
    {
      numero: 2,
      titre: "Compagnies",
      active: false,
    },
    {
      numero: 3,
      titre: "Commandement",
      active: false,
    },
    {
      numero: 4,
      titre: "Véhicules",
      active: false,
    },
    {
      numero: 5,
      titre: "Conducteurs",
      active: true,
    },
  ];

  /*
   * ============================================================
   * NOM UTILISATEUR
   * ============================================================
   */

  const getUserLabel = (user) => {
    if (!user) {
      return "Conducteur";
    }

    const grade =
      user.grade ??
      user.gradeName ??
      "";

    const prenom =
      user.firstName ??
      user.firstname ??
      user.prenom ??
      "";

    const nom =
      user.lastName ??
      user.lastname ??
      user.nom ??
      "";

    const label = [
      grade,
      prenom,
      nom,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

    return (
      label ||
      user.fullName ||
      user.name ||
      `Utilisateur ${user.id ?? ""}`
    );
  };


  /*
   * ============================================================
   * VÉHICULES
   * ============================================================
   */

  const getVehiculeId = (vehicule) => {
    if (!vehicule) {
      return null;
    }

    if (typeof vehicule === "string") {
      return vehicule;
    }

    return (
      vehicule.vehiculeId ??
      vehicule.vehicule?.id ??
      vehicule.id ??
      null
    );
  };

  const getVehiculeLabel = (vehicule) => {
    if (!vehicule) {
      return "Véhicule";
    }

    const nom =
      vehicule.nom ??
      vehicule.vehiculeName ??
      vehicule.name ??
      vehicule.type ??
      vehicule.vehicule?.nom ??
      vehicule.vehicule?.vehiculeName ??
      vehicule.vehicule?.name ??
      vehicule.vehicule?.type ??
      "Véhicule";

    const immatriculation =
      vehicule.immatriculation ??
      vehicule.registration ??
      vehicule.plaque ??
      vehicule.vehicule?.immatriculation ??
      "";

    if (immatriculation) {
      return `${nom} — ${immatriculation}`;
    }

    return nom;
  };

  /*
   * ============================================================
   * GROUPE
   * ============================================================
   */

  const getGroupeId = (groupe) => {
    return (
      groupe?.id ??
      groupe?.groupeId ??
      null
    );
  };

  const getSelectionsDuGroupe = (groupe) => {
    const groupeId =
      getGroupeId(groupe);

    return (
      Array.isArray(
        vehiculesSelectionnes
      )
        ? vehiculesSelectionnes
        : []
    ).filter((selection) => {
      if (
        !selection ||
        typeof selection !== "object"
      ) {
        return false;
      }

      const selectionGroupeId =
        selection.groupeId ??
        selection.missionGroupeId ??
        null;

      /*
       * Si le véhicule n'a pas de groupe,
       * on le rattache au groupe unique.
       */

      if (
        !selectionGroupeId ||
        !groupeId
      ) {
        return (
          groupesAAfficher.length === 1
        );
      }

      return (
        String(selectionGroupeId) ===
        String(groupeId)
      );
    });
  };

  const getVehiculesDuGroupe = (groupe) => {
    const selections =
      getSelectionsDuGroupe(groupe);

    const complets = Array.isArray(
      vehiculesSelectionnesComplets
    )
      ? vehiculesSelectionnesComplets
      : [];

    const vehiculesComplets =
      complets.filter(
        (vehicule) => {
          const id = String(
            getVehiculeId(vehicule) ?? ""
          );

          return selections.some(
            (selection) =>
              String(
                getVehiculeId(selection) ?? ""
              ) === id
          );
        }
      );

    if (
      vehiculesComplets.length > 0
    ) {
      return vehiculesComplets;
    }

    return selections
      .map((selection) => {
        const id =
          getVehiculeId(selection);

        if (!id) {
          return null;
        }

        return {
          ...selection,
          id,
          vehiculeId: id,
        };
      })
      .filter(Boolean);
  };

  /*
   * ============================================================
   * CONDUCTEUR ACTUEL
   * ============================================================
   */

  const getConducteurId = (
    vehiculeId
  ) => {
    const selection =
      (
        Array.isArray(
          vehiculesSelectionnes
        )
          ? vehiculesSelectionnes
          : []
      ).find(
        (item) =>
          String(
            getVehiculeId(item) ?? ""
          ) ===
          String(vehiculeId)
      );

    return (
      selection?.conducteurId ??
      selection?.conducteur?.id ??
      ""
    );
  };

  /*
   * ============================================================
   * CHANGEMENT CONDUCTEUR
   * ============================================================
   */

  const handleConducteurChange = (
    vehiculeId,
    conducteurId
  ) => {
    setConducteurVehicule(
      vehiculeId,
      conducteurId || null
    );
  };

  /*
   * ============================================================
   * AFFECTATIONS
   * ============================================================
   */

  const affectations = useMemo(() => {
    return (
      Array.isArray(
        vehiculesSelectionnes
      )
        ? vehiculesSelectionnes
        : []
    )
      .map((selection) => ({
        vehiculeId:
          getVehiculeId(selection),

        groupeId:
          selection?.groupeId ??
          selection?.missionGroupeId ??
          null,

        conducteurId:
          selection?.conducteurId ??
          selection?.conducteur?.id ??
          null,
      }))
      .filter(
        (item) => item.vehiculeId
      );
  }, [vehiculesSelectionnes]);

  /*
   * ============================================================
   * SAUVEGARDE
   * ============================================================
   */

  const handleContinuer = async () => {
    if (!missionId) {
      alert(
        "Aucune mission sélectionnée."
      );
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload =
        affectations.map(
          (affectation) => ({
            vehiculeId:
              affectation.vehiculeId,

            groupeId:
              affectation.groupeId,

            conducteurId:
              affectation.conducteurId ||
              null,
          })
        );

      console.log(
        "[ÉTAPE 5] Affectations conducteurs :",
        payload
      );

      await updateMissionConducteurs(
        missionId,
        payload
      );

      navigate(
        "/admin/missions"
      );
    } catch (err) {
      console.error(
        "[ÉTAPE 5] Erreur sauvegarde conducteurs :",
        err
      );

      const message =
        err?.response?.data?.message ??
        err?.message ??
        "Impossible de sauvegarder les conducteurs.";

      setError(message);
      alert(message);
    } finally {
      setSaving(false);
    }
  };

  /*
   * ============================================================
   * RENDU
   * ============================================================
   */

  return (
    <MainLayout>
      <div className="mx-auto w-full max-w-7xl px-6 py-8">

        {/* ======================================================
            TIMELINE
        ====================================================== */}

        <div className="mb-10">

          <div className="flex items-center justify-between">

            {etapes.map(
              (etape, index) => (
                <div
                  key={etape.numero}
                  className="flex flex-1 items-center"
                >

                  <div className="flex flex-col items-center">

                    <div
                      className={`
                        flex h-10 w-10 items-center justify-center
                        rounded-full border-2 text-sm font-semibold
                        ${
                          etape.active
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-gray-300 bg-white text-gray-500"
                        }
                      `}
                    >
                      {etape.numero}
                    </div>

                    <span
                      className={`
                        mt-2 whitespace-nowrap text-xs
                        ${
                          etape.active
                            ? "font-semibold text-blue-600"
                            : "text-gray-500"
                        }
                      `}
                    >
                      {etape.titre}
                    </span>

                  </div>

                  {index <
                    etapes.length - 1 && (
                    <div className="mx-3 h-0.5 flex-1 bg-gray-200" />
                  )}

                </div>
              )
            )}

          </div>

        </div>

        {/* ======================================================
            TITRE
        ====================================================== */}

        <div className="mb-6">

          <h1 className="text-2xl font-bold text-gray-900">
            Conducteurs
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Affectez un conducteur à chaque véhicule
            de la mission.
          </p>

        </div>

        {/* ======================================================
            ERREUR
        ====================================================== */}

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* ======================================================
            CHARGEMENT
        ====================================================== */}

        {conducteursMission.length === 0 ? (
          <div className="rounded-xl border bg-white p-8 text-center">

            <p className="font-medium text-gray-900">
              Aucun conducteur disponible
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Aucun personnel affecté à cette mission
              ne peut actuellement être sélectionné
              comme conducteur.
            </p>

          </div>
        ) : (
          <div className="space-y-6">

            {groupesAAfficher.map(
              (groupe, index) => {

                const groupeId =
                  getGroupeId(groupe);

                const vehicules =
                  getVehiculesDuGroupe(
                    groupe
                  );

                return (
                  <section
                    key={
                      groupeId ??
                      `groupe-${index}`
                    }
                    className="rounded-xl border bg-white p-6"
                  >

                    <div className="mb-5">

                      <h2 className="text-lg font-semibold text-gray-900">
                        {groupe?.nom ??
                          groupe?.nomGroupe ??
                          `Groupe ${index + 1}`}
                      </h2>

                      <p className="text-sm text-gray-500">
                        {vehicules.length} véhicule
                        {vehicules.length > 1
                          ? "s"
                          : ""}
                      </p>

                    </div>

                    {vehicules.length ===
                    0 ? (
                      <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500">
                        Aucun véhicule affecté à ce
                        groupe.
                      </div>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

                        {vehicules.map(
                          (vehicule) => {

                            const vehiculeId =
                              getVehiculeId(
                                vehicule
                              );

                            const conducteurId =
                              getConducteurId(
                                vehiculeId
                              );

                            return (
                              <div
                                key={
                                  vehiculeId
                                }
                                className="rounded-lg border p-4"
                              >

                                <div className="mb-4">

                                  <p className="font-semibold text-gray-900">
                                    {getVehiculeLabel(
                                      vehicule
                                    )}
                                  </p>

                                </div>

                                <label
                                  htmlFor={`conducteur-${vehiculeId}`}
                                  className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                  Conducteur
                                </label>

                                <select
                                  id={`conducteur-${vehiculeId}`}
                                  value={
                                    conducteurId
                                  }
                                  onChange={(
                                    event
                                  ) =>
                                    handleConducteurChange(
                                      vehiculeId,
                                      event
                                        .target
                                        .value
                                    )
                                  }
                                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                >

                                  <option value="">
                                    Sélectionner un conducteur
                                  </option>

                                  {conducteursMission.map(
                                    (
                                      conducteur
                                    ) => (
                                      <option
                                        key={
                                          conducteur.id
                                        }
                                        value={
                                          conducteur.id
                                        }
                                      >
                                        {getUserLabel(
                                          conducteur
                                        )}
                                      </option>
                                    )
                                  )}

                                </select>

                              </div>
                            );
                          }
                        )}

                      </div>
                    )}

                  </section>
                );
              }
            )}

          </div>
        )}

        {/* ======================================================
            NAVIGATION
        ====================================================== */}

        <div className="mt-8 flex items-center justify-between border-t pt-6">

          <button
            type="button"
            onClick={() =>
              navigate(-1)
            }
            disabled={saving}
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Précédent
          </button>

          <button
            type="button"
            onClick={
              handleContinuer
            }
            disabled={
              saving
            }
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Enregistrement..."
              : "Terminer"}
          </button>

        </div>

      </div>
    </MainLayout>
  );
}

export default CreerMissions5Admin;