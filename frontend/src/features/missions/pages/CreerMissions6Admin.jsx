import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";

import { useMissions2 } from "../hooks/useMissions2";
import {
  updateMissionConducteurs,
} from "../api/missions.api";

function CreerMissions6Admin() {
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
    /*
     * Les groupes générés contiennent déjà les utilisateurs
     * complets dans groupe.utilisateurs[].user.
     *
     * On utilise donc en priorité les utilisateurs réellement
     * affectés aux groupes.
     */

    const utilisateursDesGroupes = Array.isArray(groupesAAfficher)
      ? groupesAAfficher
        .flatMap((groupe) =>
          Array.isArray(groupe?.utilisateurs)
            ? groupe.utilisateurs
            : []
        )
        .map(extractUser)
        .filter(Boolean)
      : [];

    /*
     * Fallback : si aucun utilisateur n'est présent dans
     * les groupes, on utilise usersDisponibles.
     */

    const utilisateurs =
      utilisateursDesGroupes.length > 0
        ? utilisateursDesGroupes
        : Array.isArray(usersDisponibles)
          ? usersDisponibles
            .map(extractUser)
            .filter(Boolean)
          : [];


    const conducteurs = utilisateurs.filter((user) => {
      const roleName = String(
        user?.role?.roleName ??
        user?.roleName ??
        ""
      )
        .trim()
        .toUpperCase();

      return (
        roleName === "CONDUCTEUR" ||
        roleName === "SOA" ||
        roleName === "OAL"
      );
    });


    return Array.from(
      new Map(
        conducteurs
          .filter((user) => user?.id)
          .map((user) => [
            String(user.id),
            user,
          ])
      ).values()
    );
  }, [groupesAAfficher, usersDisponibles]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

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
              <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-green-600 bg-green-50 text-xs font-bold text-green-700  shadow-sm sm:h-8 sm:w-8 sm:text-sm">
                ✓
              </div>

              <span className="mt-1.5 max-w-24 text-center text-[9px] font-bold leading-tight text-green-700 sm:mt-2 sm:max-w-none sm:text-xs">
                Affectations des compagnies
              </span>
            </div>

            <div className="mt-3 h-0.5 min-w-4 flex-1 bg-gray-200 sm:mt-4 sm:min-w-6" />

            {/* Étape 3 */}
            <div className="flex min-w-0 shrink-0 flex-1 flex-col items-center">
              <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 bborder-green-600 bg-green-50 text-xs font-bold text-green-700  sm:h-8 sm:w-8 sm:text-sm">
                ✓
              </div>

              <span className="mt-1.5 max-w-24 text-center text-[9px] font-semibold leading-tight text-green-700 sm:mt-2 sm:max-w-none sm:text-xs">
                Désignation de l'OAL
              </span>
            </div>

            <div className="mt-3 h-0.5 min-w-4 flex-1 bg-gray-200 sm:mt-4 sm:min-w-6" />

            {/* Étape 4 */}
            <div className="flex min-w-0 shrink-0 flex-1 flex-col items-center">
              <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-green-600 bg-green-50 text-xs font-bold text-green-700  sm:h-8 sm:w-8 sm:text-sm">
                ✓
              </div>

              <span className="mt-1.5 max-w-20 text-center text-[9px] font-semibold leading-tight text-green-700 sm:mt-2 sm:max-w-none sm:text-xs">
                Véhicules
              </span>
            </div>

            <div className="mt-3 h-0.5 min-w-4 flex-1 bg-gray-200 sm:mt-4 sm:min-w-6" />

            {/* Étape 5 */}
            <div className="flex min-w-0 shrink-0 flex-1 flex-col items-center">
              <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-green-600 bg-green-50 text-xs font-bold text-green-700 sm:h-8 sm:w-8 sm:text-sm">
                5
              </div>

              <span className="mt-1.5 max-w-24 text-center text-[9px] font-semibold leading-tight text-green-700 sm:mt-2 sm:max-w-none sm:text-xs">
                Désignation du ou des SOA
              </span>
            </div>

            <div className="mt-3 h-0.5 min-w-4 flex-1 bg-gray-200 sm:mt-4 sm:min-w-6" />

            {/* Étape 6 */}
            <div className="flex min-w-0 shrink-0 flex-1 flex-col items-center">
              <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-blue-600 bg-blue-600 text-xs font-bold text-white sm:h-8 sm:w-8 sm:text-sm">
                6
              </div>

              <span className="mt-1.5 max-w-20 text-center text-[9px] font-semibold leading-tight text-blue-700 sm:mt-2 sm:max-w-none sm:text-xs">
                Conducteurs
              </span>
            </div>

          </div>
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

export default CreerMissions6Admin;