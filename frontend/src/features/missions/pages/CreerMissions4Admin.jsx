import { useMemo, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { useMissions2 } from "../hooks/useMissions2";
import { updateMissionConducteurs } from "../api/missions.api";
import { useCompagnies } from "../../compagnies/hooks/useCompagnies";

function CreerMission4Admin() {
  const navigate = useNavigate();

  const {
    missionId,
    groupes = [],
    groupesManuels = [],
    creerGroupeManuel,
    setSoa,
    setConducteurVehicule,
    usersDisponibles = [],
    vehiculesSelectionnes = [],
    vehiculesSelectionnesComplets = [],
  } = useMissions2();

  const {
    compagnies = [],
    loading: compagniesLoading,
  } = useCompagnies();

  // ==========================================
  // UTILISATEURS
  // ==========================================

  const getUserLabel = (user) => {
    if (!user) return "Utilisateur";

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

  // ==========================================
  // OA RESPONSABLE DE LA MISSION
  // ==========================================

  const [oaResponsableMission, setOaResponsableMission] =
    useState(null);

  const groupesAAfficher =
    groupes.length > 0
      ? groupes
      : groupesManuels;
  const normaliserUtilisateur = (
    user
  ) => {
    if (!user) return null;

    if (
      typeof user === "object" &&
      user.user
    ) {
      return user.user;
    }

    if (
      typeof user === "object"
    ) {
      return user;
    }

    return (
      usersDisponibles.find(
        (item) =>
          String(item?.id) ===
          String(user)
      ) ?? null
    );
  };
  /**
   * Recherche l'OA responsable d'une compagnie.
   *
   * Une compagnie peut retourner :
   * - compagnie.oa
   * - compagnie.oaId
   */

  /**
   * Détermination automatique de l'OA.
   *
   * Logique :
   *
   * SOA sélectionné
   *       ↓
   * compagnie du SOA
   *       ↓
   * OA de la compagnie
   *       ↓
   * OA responsable de la mission
   */
  useEffect(() => {
    if (compagniesLoading) return;

    console.log("========== [OA AUTO] ==========");

    const groupeAvecSoa = groupesAAfficher.find(
      (groupe) => groupe?.soaId
    );

    console.log(
      "[OA AUTO] Groupe avec SOA :",
      groupeAvecSoa
    );

    if (!groupeAvecSoa?.soaId) {
      console.log("[OA AUTO] Aucun SOA sélectionné");
      setOaResponsableMission(null);
      return;
    }

    const soaId = groupeAvecSoa.soaId;

    console.log(
      "[OA AUTO] SOA ID :",
      soaId
    );

    // On cherche d'abord dans les utilisateurs du groupe.
    const utilisateursGroupe =
      groupeAvecSoa?.utilisateurs ??
      groupeAvecSoa?.users ??
      [];

    let soa = utilisateursGroupe
      .map(normaliserUtilisateur)
      .find(
        (user) =>
          String(user?.id) ===
          String(soaId)
      );

    // Fallback dans usersDisponibles.
    if (!soa) {
      soa = usersDisponibles.find(
        (user) =>
          String(user?.id) ===
          String(soaId)
      );
    }

    console.log(
      "[OA AUTO] SOA trouvé :",
      soa
    );

    if (!soa) {
      console.log(
        "[OA AUTO] Impossible de trouver le SOA"
      );

      setOaResponsableMission(null);
      return;
    }

    let compagnie = null;

    // 1. Compagnie directement présente sur le groupe
    if (groupeAvecSoa.compagnieId) {
      compagnie = compagnies.find(
        (item) =>
          String(item?.id) ===
          String(groupeAvecSoa.compagnieId)
      );
    }

    // 2. Compagnie directement présente sur le SOA
    if (!compagnie && soa.compagnieId) {
      compagnie = compagnies.find(
        (item) =>
          String(item?.id) ===
          String(soa.compagnieId)
      );
    }

    // 3. Compagnie via la section du SOA
    if (!compagnie && soa.sectionId) {
      compagnie = compagnies.find(
        (item) =>
          Array.isArray(item?.sections) &&
          item.sections.some(
            (section) =>
              String(section?.id) ===
              String(soa.sectionId)
          )
      );
    }

    console.log(
      "[OA AUTO] Compagnie trouvée :",
      compagnie
    );

    if (!compagnie) {
      console.log(
        "[OA AUTO] Impossible de trouver la compagnie"
      );

      setOaResponsableMission(null);
      return;
    }

    // Récupération de l'OA
    let oa = null;

    // Priorité à l'objet OA fourni par l'API
    if (compagnie.oa?.id) {
      oa = compagnie.oa;
    }

    // Sinon recherche par oaId
    if (!oa && compagnie.oaId) {
      oa = usersDisponibles.find(
        (user) =>
          String(user?.id) ===
          String(compagnie.oaId)
      );
    }

    console.log(
      "[OA AUTO] OA trouvé :",
      oa
    );

    if (!oa) {
      console.log(
        "[OA AUTO] Aucun OA trouvé pour cette compagnie",
        {
          compagnieId: compagnie.id,
          compagnieNom: compagnie.nom,
          oaId: compagnie.oaId,
        }
      );

      setOaResponsableMission(null);
      return;
    }

    console.log(
      "[OA AUTO] OA RESPONSABLE DE LA MISSION :",
      {
        id: oa.id,
        nom: getUserLabel(oa),
      }
    );

    setOaResponsableMission(oa);
  }, [
    groupesAAfficher,
    usersDisponibles,
    compagnies,
    compagniesLoading,
  ]);

  const oaResponsableNom =
    oaResponsableMission
      ? getUserLabel(
        oaResponsableMission
      )
      : "Non défini";

  // ==========================================
  // UTILISATEURS DES GROUPES
  // ==========================================



  const getGroupeUsers = (
    groupe
  ) => {
    const utilisateurs =
      groupe?.utilisateurs ??
      groupe?.users ??
      [];

    return utilisateurs
      .map(
        normaliserUtilisateur
      )
      .filter(Boolean);
  };

  // Conducteurs dispo

  const getConducteursDisponibles = (
    groupe
  ) => {
    return getGroupeUsers(
      groupe
    ).filter((user) => {
      const roleName =
        String(
          user?.role?.roleName ??
          ""
        )
          .trim()
          .toLowerCase();

      return (
        roleName === "conducteur" ||
        roleName === "soa" ||
        roleName === "oa"
      );
    });
  };

  // ==========================================
  // SOA DISPONIBLES
  // ==========================================

  const getSoaDisponibles = (
    groupe
  ) => {
    const utilisateurs =
      getGroupeUsers(
        groupe
      );

    console.log(
      "========== [SOA DEBUG] =========="
    );

    console.log(
      "[SOA DEBUG] Groupe :",
      groupe
    );

    console.log(
      "[SOA DEBUG] Utilisateurs du groupe :",
      utilisateurs
    );

    utilisateurs.forEach(
      (user, index) => {
        console.log(
          `[SOA DEBUG] Utilisateur ${index + 1
          } :`,
          {
            id: user?.id,
            nom: user?.lastName,
            prenom: user?.firstName,
            role: user?.role,
            roleId: user?.roleId,
            role_id: user?.role_id,
            objetRole: user?.Role,
          }
        );
      }
    );

    const soa =
      utilisateurs.filter(
        (user) => {
          const role =
            String(
              user?.role?.roleName ??
              user?.Role ??
              user?.user?.role ??
              ""
            )
              .trim()
              .toLowerCase();

          console.log(
            "[SOA DEBUG] Role analysé :",
            {
              userId: user?.id,
              role,
              user,
            }
          );

          return role === "soa";
        }
      );

    console.log(
      "[SOA DEBUG] SOA trouvés :",
      soa
    );

    return soa;
  };

  // ==========================================
  // VÉHICULES
  // ==========================================

  const getVehiculeLabel = (
    vehicule
  ) => {
    if (!vehicule) {
      return "Véhicule";
    }

    const nom =
      vehicule?.nom ??
      vehicule?.vehiculeName ??
      vehicule?.name ??
      vehicule?.type ??
      vehicule?.vehicule?.nom ??
      vehicule?.vehicule
        ?.vehiculeName ??
      vehicule?.vehicule?.name ??
      vehicule?.vehicule?.type ??
      "Véhicule";

    const immatriculation =
      vehicule?.immatriculation ??
      vehicule?.registration ??
      vehicule?.plaque ??
      vehicule?.vehicule
        ?.immatriculation ??
      "";

    return immatriculation
      ? `${nom} - ${immatriculation}`
      : nom;
  };

  const getVehiculeId = (
    selection
  ) => {
    if (!selection) {
      return null;
    }

    if (
      typeof selection ===
      "string"
    ) {
      return selection;
    }

    return (
      selection?.vehiculeId ??
      selection?.vehicule?.id ??
      selection?.id ??
      null
    );
  };

  const getSelectionsDuGroupe = (
    groupe
  ) => {
    const groupeId =
      groupe?.id ??
      groupe?.groupeId ??
      null;

    const groupeNom =
      String(
        groupe?.nom ??
        groupe?.nomGroupe ??
        ""
      )
        .trim()
        .toLowerCase();

    const selections =
      Array.isArray(
        vehiculesSelectionnes
      )
        ? vehiculesSelectionnes
        : [];

    return selections.filter(
      (selection) => {
        if (
          !selection ||
          typeof selection !==
          "object"
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
            ""
          )
            .trim()
            .toLowerCase();

        // Priorité à l'ID.
        if (
          selectionGroupeId &&
          groupeId
        ) {
          return (
            String(
              selectionGroupeId
            ) ===
            String(groupeId)
          );
        }

        // Fallback sur le nom.
        if (
          selectionGroupeNom &&
          groupeNom
        ) {
          return (
            selectionGroupeNom ===
            groupeNom
          );
        }

        // S'il n'y a qu'un groupe,
        // les véhicules lui appartiennent.
        return (
          groupesAAfficher.length ===
          1
        );
      }
    );
  };

  const getVehiculesDuGroupe = (
    groupe
  ) => {
    const sourceVehicules =
      Array.isArray(
        vehiculesSelectionnesComplets
      )
        ? vehiculesSelectionnesComplets
        : [];

    const selectionsDuGroupe =
      getSelectionsDuGroupe(
        groupe
      );

    const vehiculesCompletsDuGroupe =
      sourceVehicules.filter(
        (vehicule) => {
          const vehiculeId =
            String(
              vehicule?.id ??
              vehicule?.vehiculeId ??
              vehicule?.vehicule?.id ??
              ""
            );

          return selectionsDuGroupe.some(
            (selection) =>
              String(
                selection?.vehiculeId ??
                selection?.vehicule?.id ??
                selection?.id ??
                ""
              ) === vehiculeId
          );
        }
      );

    if (
      vehiculesCompletsDuGroupe.length >
      0
    ) {
      return vehiculesCompletsDuGroupe;
    }

    // Fallback.
    return selectionsDuGroupe
      .map((selection) => {
        const id =
          getVehiculeId(
            selection
          );

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

  // ==========================================
  // CONDUCTEUR D'UN VÉHICULE
  // ==========================================

  const getConducteurId = (
    vehiculeId,
    groupeId
  ) => {
    const selection =
      (
        vehiculesSelectionnes ??
        []
      ).find((item) => {
        if (
          typeof item ===
          "string"
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
          String(
            itemGroupeId
          ) ===
          String(groupeId)
        );
      });

    return (
      selection?.conducteurId ??
      selection?.conducteur?.id ??
      ""
    );
  };

  const handleConducteurChange = (
    vehiculeId,
    conducteurId
  ) => {
    setConducteurVehicule(
      vehiculeId,
      conducteurId
    );
  };

  // ==========================================
  // VÉRIFICATION
  // ==========================================

  const peutContinuer =
    useMemo(() => {
      if (
        !Array.isArray(
          vehiculesSelectionnes
        )
      ) {
        return false;
      }

      const vehicules =
        vehiculesSelectionnes.filter(
          (selection) =>
            typeof selection !==
            "string" &&
            getVehiculeId(
              selection
            )
        );

      if (
        vehicules.length ===
        0
      ) {
        return true;
      }

      return vehicules.every(
        (selection) =>
          Boolean(
            selection?.conducteurId ??
            selection?.conducteur
              ?.id
          )
      );
    }, [
      vehiculesSelectionnes,
    ]);

  // ==========================================
  // CONTINUER
  // ==========================================

  const handleContinuer = async () => {
    if (!missionId) {
      alert("Aucune mission n'est actuellement sélectionnée.");
      return;
    }

    if (compagniesLoading) {
      alert("Les compagnies sont encore en cours de chargement.");
      return;
    }

    if (!oaResponsableMission?.id) {
      alert(
        "Impossible de déterminer automatiquement l'OA responsable de la mission."
      );
      return;
    }

    const affectationsVehicules = (
      vehiculesSelectionnes ?? []
    )
      .filter(
        (selection) =>
          typeof selection !== "string" &&
          getVehiculeId(selection)
      )
      .map((selection) => ({
        vehiculeId: getVehiculeId(selection),

        compagnieId:
          selection?.compagnieId ?? null,

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
          !affectation.conducteurId
      );

    if (sansConducteur.length > 0) {
      alert(
        "Chaque véhicule doit avoir un conducteur avant de continuer."
      );
      return;
    }

    try {
      console.log(
        "[ÉTAPE 4] OA responsable :",
        {
          id: oaResponsableMission.id,
          nom: oaResponsableNom,
        }
      );

      console.log(
        "[ÉTAPE 4] Affectations véhicules :",
        affectationsVehicules
      );

      await updateMissionConducteurs(
        missionId,
        affectationsVehicules,
        oaResponsableMission.id
      );

      navigate("/admin/missions");
    } catch (error) {
      console.error(
        "[ÉTAPE 4] Erreur :",
        error
      );

      alert(
        error?.response?.data?.message ??
        error?.message ??
        "Impossible de sauvegarder les conducteurs."
      );
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <MainLayout>
      <div className="p-6">

        <h1 className="mb-6 text-2xl font-bold">
          Commandement
        </h1>

        {/* OA RESPONSABLE */}

        <div className="mb-6 rounded-lg border bg-white p-4">
          <p className="text-sm font-medium text-gray-500">
            OA responsable de la mission
          </p>

          <p className="mt-1 text-lg font-semibold">
            {compagniesLoading
              ? "Chargement..."
              : oaResponsableNom}
          </p>
        </div>

        {/* GROUPES */}

        <div className="flex gap-4 overflow-x-auto pb-4">

          {groupesAAfficher.map(
            (groupe, index) => {
              const conducteurs =
                getConducteursDisponibles(
                  groupe
                );

              const soa =
                getSoaDisponibles(
                  groupe
                );

              const vehiculesDuGroupe =
                getVehiculesDuGroupe(
                  groupe
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
                      `Groupe ${index + 1
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
                    onChange={(
                      event
                    ) =>
                      setSoa(
                        index,
                        event.target
                          .value
                      )
                    }
                  >
                    <option value="">
                      Sélectionner un SOA
                    </option>

                    {soa.map(
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
                            user
                          )}
                        </option>
                      )
                    )}
                  </select>

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
                        sélectionné pour ce
                        groupe.
                      </p>
                    ) : (
                      <div className="space-y-3">

                        {vehiculesDuGroupe.map(
                          (
                            vehicule
                          ) => {
                            const conducteurId =
                              getConducteurId(
                                vehicule?.id,
                                groupeId
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
                                    vehicule
                                  )}
                                </p>

                                <select
                                  className="w-full rounded border bg-white p-2 text-sm"
                                  value={
                                    conducteurId
                                  }
                                  onChange={(
                                    event
                                  ) =>
                                    handleConducteurChange(
                                      vehicule?.id,
                                      event
                                        .target
                                        .value
                                    )
                                  }
                                >
                                  <option value="">
                                    Choisir le
                                    conducteur
                                  </option>

                                  {conducteurs.map(
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

                                {conducteurId && (
                                  <p className="mt-2 text-xs font-medium text-green-700">
                                    Conducteur
                                    affecté :{" "}
                                    {getUserLabel(
                                      conducteurs.find(
                                        (
                                          user
                                        ) =>
                                          String(
                                            user.id
                                          ) ===
                                          String(
                                            conducteurId
                                          )
                                      )
                                    )}
                                  </p>
                                )}

                              </div>
                            );
                          }
                        )}

                      </div>
                    )}

                  </div>

                </div>
              );
            }
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
            disabled={
              !peutContinuer
            }
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