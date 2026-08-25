import { useMemo } from "react";
import { useMissions2 } from "../hooks/useMissions2";
import MainLayout from "@/components/layout/MainLayout";
import { useNavigate } from "react-router-dom";
import { updateMissionConducteurs } from "../api/missions.api";

function CreerMission4Admin() {
  const navigate = useNavigate();

  const {
    missionId,
    groupes = [],
    groupesManuels = [],
    creerGroupeManuel,
    setSoa,
    toggleConducteur,
    usersDisponibles = [],
    vehiculesSelectionnes = [],
    vehiculesSelectionnesComplets = [],
    setConducteurVehicule,
  } = useMissions2();

  /*
   * ==========================================
   * UTILISATEURS
   * ==========================================
   */

  const getUserLabel = (user) => {
    if (!user) {
      return "Utilisateur";
    }

    const grade =
      user.grade ??
      user.gradeName ??
      "";

    const nom =
      user.nom ??
      user.lastName ??
      user.lastname ??
      "";

    const prenom =
      user.prenom ??
      user.firstName ??
      user.firstname ??
      "";

    return `${grade} ${prenom} ${nom}`.trim();
  };

  /*
   * ==========================================
   * UTILISATEURS DU GROUPE
   * ==========================================
   */

  const getGroupeUsers = (groupe) => {
    const normaliserUtilisateur = (user) => {
      if (!user) {
        return null;
      }

      if (
        typeof user === "object" &&
        user !== null &&
        user.user
      ) {
        return user.user;
      }

      if (
        typeof user === "object" &&
        user !== null
      ) {
        return user;
      }

      return (
        usersDisponibles.find(
          (item) =>
            String(item?.id) ===
            String(user),
        ) ?? null
      );
    };

    if (
      Array.isArray(groupe?.utilisateurs) &&
      groupe.utilisateurs.length > 0
    ) {
      return groupe.utilisateurs
        .map(normaliserUtilisateur)
        .filter(Boolean);
    }

    if (
      Array.isArray(groupe?.users) &&
      groupe.users.length > 0
    ) {
      return groupe.users
        .map(normaliserUtilisateur)
        .filter(Boolean);
    }

    return [];
  };

  const getConducteursDisponibles = (groupe) => {
    return getGroupeUsers(groupe);
  };

  /*
   * ==========================================
   * VÉHICULES
   * ==========================================
   */

  const getVehiculeLabel = (vehicule) => {
    if (!vehicule) {
      return "Véhicule";
    }

    const nom =
      vehicule?.nom ??
      vehicule?.vehiculeName ??
      vehicule?.name ??
      vehicule?.type ??
      vehicule?.vehicule?.nom ??
      vehicule?.vehicule?.vehiculeName ??
      vehicule?.vehicule?.name ??
      vehicule?.vehicule?.type ??
      "Véhicule";

    const immatriculation =
      vehicule?.immatriculation ??
      vehicule?.registration ??
      vehicule?.plaque ??
      vehicule?.vehicule?.immatriculation ??
      "";

    if (immatriculation) {
      return `${nom} - ${immatriculation}`;
    }

    return nom;
  };

  /*
   * ==========================================
   * ID VÉHICULE
   * ==========================================
   */

  const getVehiculeId = (selection) => {
    if (!selection) {
      return null;
    }

    if (typeof selection === "string") {
      return selection;
    }

    return (
      selection?.vehiculeId ??
      selection?.vehicule?.id ??
      selection?.id ??
      null
    );
  };

  /*
   * ==========================================
   * VÉHICULES DU GROUPE
   * ==========================================
   */

  const getVehiculesDuGroupe = (groupe) => {
    const sourceVehicules = Array.isArray(
      vehiculesSelectionnesComplets,
    )
      ? vehiculesSelectionnesComplets
      : [];

    const groupeId =
      groupe?.id ??
      groupe?.groupeId ??
      null;

    const groupeNom = String(
      groupe?.nom ??
      groupe?.nomGroupe ??
      "",
    )
      .trim()
      .toLowerCase();

    const selections = Array.isArray(
      vehiculesSelectionnes,
    )
      ? vehiculesSelectionnes
      : [];

    /*
     * ==========================================
     * SÉLECTIONS DU GROUPE
     * ==========================================
     */

    const selectionsDuGroupe =
      selections.filter((selection) => {
        if (
          !selection ||
          typeof selection !== "object"
        ) {
          return false;
        }

        const selectionGroupeId =
          selection?.groupeId ??
          selection?.missionGroupeId ??
          null;

        const selectionGroupeNom =
          String(
            selection?.groupeNom ??
            selection?.groupe?.nom ??
            "",
          )
            .trim()
            .toLowerCase();

        /*
         * Priorité à l'ID.
         */

        if (
          selectionGroupeId &&
          groupeId
        ) {
          return (
            String(selectionGroupeId) ===
            String(groupeId)
          );
        }

        /*
         * Fallback sur le nom.
         */

        if (
          selectionGroupeNom &&
          groupeNom
        ) {
          return (
            selectionGroupeNom ===
            groupeNom
          );
        }

        /*
         * S'il n'y a qu'un groupe,
         * on considère que les véhicules
         * lui appartiennent.
         */

        return groupes.length === 1;
      });

    console.log(
      "[ÉTAPE 4] Sélections du groupe :",
      selectionsDuGroupe,
    );

    /*
     * ==========================================
     * VÉHICULES COMPLETS
     * ==========================================
     */

    const vehiculesCompletsDuGroupe =
      sourceVehicules.filter(
        (vehicule) => {
          const vehiculeId = String(
            vehicule?.id ??
            vehicule?.vehiculeId ??
            vehicule?.vehicule?.id ??
            "",
          );

          return selectionsDuGroupe.some(
            (selection) =>
              String(
                selection?.vehiculeId ??
                selection?.vehicule?.id ??
                selection?.id ??
                "",
              ) === vehiculeId,
          );
        },
      );

    if (
      vehiculesCompletsDuGroupe.length > 0
    ) {
      console.log(
        "[ÉTAPE 4] VÉHICULES COMPLETS RÉSOLUS :",
        vehiculesCompletsDuGroupe,
      );

      return vehiculesCompletsDuGroupe;
    }

    /*
     * ==========================================
     * FALLBACK
     * ==========================================
     */

    return selectionsDuGroupe
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

          nom:
            selection?.nom ??
            selection?.vehiculeNom ??
            selection?.type ??
            "Véhicule",

          type:
            selection?.type ??
            "",

          immatriculation:
            selection?.immatriculation ??
            "",
        };
      })
      .filter(Boolean);
  };

  /*
   * ==========================================
   * CONDUCTEUR D'UN VÉHICULE
   * ==========================================
   */

  const getConducteurId = (
    vehiculeId,
    groupeId,
  ) => {
    const selection =
      (
        vehiculesSelectionnes ?? []
      ).find((item) => {
        if (
          typeof item === "string"
        ) {
          return false;
        }

        const id =
          getVehiculeId(item);

        if (
          String(id) !==
          String(vehiculeId)
        ) {
          return false;
        }

        const itemGroupeId =
          item?.groupeId ??
          item?.missionGroupeId ??
          null;

        if (
          !itemGroupeId ||
          !groupeId
        ) {
          return true;
        }

        return (
          String(itemGroupeId) ===
          String(groupeId)
        );
      });

    return (
      selection?.conducteurId ??
      selection?.conducteur?.id ??
      ""
    );
  };

  /*
   * ==========================================
   * CHANGEMENT CONDUCTEUR
   * ==========================================
   */

  const handleConducteurChange = (
    vehiculeId,
    conducteurId,
  ) => {
    console.log(
      "[ÉTAPE 4] Changement conducteur :",
      {
        vehiculeId,
        conducteurId,
      },
    );

    setConducteurVehicule(
      vehiculeId,
      conducteurId,
    );
  };

  /*
   * ==========================================
   * GROUPES
   * ==========================================
   */

  const groupesAAfficher =
    groupes.length > 0
      ? groupes
      : groupesManuels;

  /*
   * ==========================================
   * VÉRIFICATION
   * ==========================================
   */

  const peutContinuer = useMemo(() => {
    if (
      !Array.isArray(
        vehiculesSelectionnes,
      )
    ) {
      return false;
    }

    const vehicules =
      vehiculesSelectionnes.filter(
        (selection) =>
          typeof selection !==
            "string" &&
          getVehiculeId(selection),
      );

    if (
      vehicules.length === 0
    ) {
      return true;
    }

    return vehicules.every(
      (selection) =>
        Boolean(
          selection?.conducteurId ??
          selection?.conducteur?.id,
        ),
    );
  }, [
    vehiculesSelectionnes,
  ]);

  /*
   * ==========================================
   * CONTINUER
   * ==========================================
   */

  const handleContinuer = async () => {
    if (!missionId) {
      alert(
        "Aucune mission n'est actuellement sélectionnée.",
      );

      return;
    }

    const affectationsVehicules =
      (
        vehiculesSelectionnes ?? []
      )
        .filter(
          (selection) =>
            typeof selection !==
              "string" &&
            getVehiculeId(selection),
        )
        .map((selection) => ({
          vehiculeId:
            getVehiculeId(
              selection,
            ),

          compagnieId:
            selection?.compagnieId ??
            null,

          groupeId:
            selection?.groupeId ??
            selection?.missionGroupeId ??
            null,

          conducteurId:
            selection?.conducteurId ??
            selection?.conducteur?.id ??
            null,
        }));

    const sansConducteur =
      affectationsVehicules.filter(
        (affectation) =>
          !affectation.conducteurId,
      );

    if (
      sansConducteur.length > 0
    ) {
      alert(
        "Chaque véhicule doit avoir un conducteur avant de continuer.",
      );

      return;
    }

    try {
      console.log(
        "[ÉTAPE 4] Affectations envoyées :",
        affectationsVehicules,
      );

      await updateMissionConducteurs(
        missionId,
        affectationsVehicules,
      );

      console.log(
        "[ÉTAPE 4] Conducteurs sauvegardés.",
      );

      navigate(
        `/admin/missions`,
      );
    } catch (error) {
      console.error(
        "[ÉTAPE 4] Erreur :",
        error,
      );

      alert(
        error?.response?.data
          ?.message ??
        error?.message ??
        "Impossible de sauvegarder les conducteurs.",
      );
    }
  };

  /*
   * ==========================================
   * DEBUG
   * ==========================================
   */

  console.log(
    "[ÉTAPE 4] GROUPES :",
    groupesAAfficher,
  );

  console.log(
    "[ÉTAPE 4] VÉHICULES SÉLECTIONNÉS :",
    vehiculesSelectionnes,
  );

  console.log(
    "[ÉTAPE 4] VÉHICULES COMPLETS :",
    vehiculesSelectionnesComplets,
  );

  groupesAAfficher.forEach(
    (groupe, index) => {
      console.log(
        `[ÉTAPE 4] GROUPE ${index + 1} :`,
        {
          id:
            groupe?.id ??
            groupe?.groupeId,

          nom:
            groupe?.nom ??
            groupe?.nomGroupe,

          utilisateurs:
            getGroupeUsers(
              groupe,
            ),

          vehicules:
            getVehiculesDuGroupe(
              groupe,
            ),
        },
      );
    },
  );

  /*
   * ==========================================
   * RENDER
   * ==========================================
   */

  return (
    <MainLayout>
      <div className="p-6">

        <h1 className="mb-6 text-2xl font-bold">
          Commandement
        </h1>

        <div className="flex gap-4 overflow-x-auto pb-4">

          {groupesAAfficher.map(
            (groupe, index) => {
              const conducteurs =
                getConducteursDisponibles(
                  groupe,
                );

              const vehiculesDuGroupe =
                getVehiculesDuGroupe(
                  groupe,
                );

              const groupeId =
                groupe?.id ??
                groupe?.groupeId;

              return (
                <div
                  key={
                    groupeId ??
                    `groupe-${index}`
                  }
                  className="flex w-80 shrink-0 flex-col gap-2 rounded-lg border p-4"
                >

                  <h2 className="text-lg font-semibold">
                    {groupe?.nom ??
                      groupe?.nomGroupe ??
                      `Groupe ${
                        index + 1
                      }`}
                  </h2>

                  {/* SOA */}

                  <p className="text-sm font-medium">
                    SOA
                  </p>

                  <select
                    className="w-full rounded border p-2"
                    value={
                      groupe?.soaId ??
                      ""
                    }
                    onChange={(event) =>
                      setSoa(
                        index,
                        event.target.value,
                      )
                    }
                  >
                    <option value="">
                      Sélectionner un SOA
                    </option>

                    {conducteurs.map(
                      (user) => (
                        <option
                          key={
                            user.id
                          }
                          value={
                            user.id
                          }
                        >
                          {getUserLabel(
                            user,
                          )}
                        </option>
                      ),
                    )}
                  </select>

                  {/* UTILISATEURS */}

                  <p className="mt-4 text-sm font-medium">
                    Utilisateurs du groupe
                  </p>

                  <div className="space-y-2">

                    {conducteurs.map(
                      (user) => (
                        <label
                          key={
                            user.id
                          }
                          className="flex items-center gap-2 text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={(
                              groupe?.conducteurIds ??
                              groupe?.conducteursIds ??
                              []
                            ).includes(
                              user.id,
                            )}
                            onChange={() =>
                              toggleConducteur(
                                index,
                                user.id,
                              )
                            }
                          />

                          {getUserLabel(
                            user,
                          )}
                        </label>
                      ),
                    )}

                    {conducteurs.length ===
                      0 && (
                      <p className="text-sm text-gray-500">
                        Aucun utilisateur
                        détecté dans ce
                        groupe.
                      </p>
                    )}

                  </div>

                  {/* VÉHICULES */}

                  <div className="mt-5 border-t pt-4">

                    <p className="mb-3 text-sm font-medium">
                      Véhicules /
                      conducteurs
                    </p>

                    {vehiculesDuGroupe.length ===
                      0 ? (
                      <p className="text-sm text-gray-500">
                        Aucun véhicule
                        sélectionné pour
                        ce groupe.
                      </p>
                    ) : (
                      <div className="space-y-3">

                        {vehiculesDuGroupe.map(
                          (vehicule) => {
                            const conducteurId =
                              getConducteurId(
                                vehicule?.id,
                                groupeId,
                              );

                            return (
                              <div
                                key={
                                  vehicule?.id
                                }
                                className="rounded-lg border bg-gray-50 p-3"
                              >

                                <p className="mb-2 text-sm font-semibold">
                                  {getVehiculeLabel(
                                    vehicule,
                                  )}
                                </p>

                                <select
                                  className="w-full rounded border bg-white p-2 text-sm"
                                  value={
                                    conducteurId
                                  }
                                  onChange={(
                                    event,
                                  ) =>
                                    handleConducteurChange(
                                      vehicule?.id,
                                      event.target.value,
                                    )
                                  }
                                >
                                  <option value="">
                                    Choisir le
                                    conducteur
                                  </option>

                                  {conducteurs.map(
                                    (
                                      conducteur,
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
                                          conducteur,
                                        )}
                                      </option>
                                    ),
                                  )}
                                </select>

                                {conducteurId && (
                                  <p className="mt-2 text-xs font-medium text-green-700">
                                    Conducteur
                                    affecté :{" "}
                                    {getUserLabel(
                                      conducteurs.find(
                                        (user) =>
                                          String(
                                            user.id,
                                          ) ===
                                          String(
                                            conducteurId,
                                          ),
                                      ),
                                    )}
                                  </p>
                                )}

                              </div>
                            );
                          },
                        )}

                      </div>
                    )}

                  </div>

                </div>
              );
            },
          )}

          {/* AJOUTER UN GROUPE */}

          <div className="flex min-h-[600px] w-80 shrink-0 items-start justify-center rounded-lg border-2 border-dashed p-4">

            <button
              type="button"
              onClick={
                creerGroupeManuel
              }
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              + Ajouter un groupe
            </button>

          </div>

        </div>

        {/* NAVIGATION */}

        <div className="mt-8 flex justify-between">

          <button
            type="button"
            onClick={() =>
              navigate(-1)
            }
            className="rounded border px-4 py-2 hover:bg-gray-100"
          >
            Précédent
          </button>

          <button
            type="button"
            onClick={
              handleContinuer
            }
            disabled={!peutContinuer}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Suivant
          </button>

        </div>

      </div>
    </MainLayout>
  );
}

export default CreerMission4Admin;