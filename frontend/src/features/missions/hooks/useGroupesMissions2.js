import { useEffect, useMemo } from "react";
import { useMission } from "../context/useMission";
import {
  getMissionGroupes,
} from "../api/missions.api";

const asArray = (value) => {
  if (Array.isArray(value)) return value;
  if (value instanceof Set) return [...value];
  return [];
};

const createGroupId = () => {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `groupe-${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`;
};

const getUserId = (user) => {
  if (user === null || user === undefined) {
    return null;
  }

  if (typeof user !== "object") {
    return user;
  }

  return (
    user.id ??
    user.userId ??
    user.utilisateurId ??
    user.user?.id ??
    null
  );
};

const extractGroupUsers = (groupe) => {
  const sources = [
    groupe?.users,
    groupe?.userIds,
    groupe?.utilisateurs,
    groupe?.membres,
    groupe?.usersSelectionnes,
    groupe?.missionUsers,
    groupe?.missionsUsers,
  ];

  const ids = [];

  sources.forEach((source) => {
    asArray(source).forEach((user) => {
      const userId = getUserId(user);

      if (
        userId !== null &&
        userId !== undefined &&
        !ids.includes(userId)
      ) {
        ids.push(userId);
      }
    });
  });

  return ids;
};

const normalizeGroupe = (groupe, index) => ({
  ...groupe,

  id:
    groupe?.id ??
    groupe?.groupeId ??
    createGroupId(),

  nom:
    groupe?.nom ??
    groupe?.nomGroupe ??
    `Groupe ${index + 1}`,

  users: extractGroupUsers(groupe),

  soaId:
    groupe?.soaId ??
    groupe?.soa?.id ??
    null,

  conducteurIds: asArray(
    groupe?.conducteurIds ??
      groupe?.conducteurs?.map?.((conducteur) =>
        getUserId(conducteur)
      )
  ).filter(Boolean),
});

export function useGroupesMissions2({
  missionId,
  usersSelectionnesIds = [],
  sectionsSelectionnees = [],
  getUsersSection,
} = {}) {
  const {
    groupesManuels,
    setGroupesManuels,
    sectionsIgnorees,
    setSectionsIgnorees,
  } = useMission();

  /*
   * ==========================================
   * CHARGEMENT DES GROUPES D'UNE MISSION
   * ==========================================
   */

  useEffect(() => {
    if (!missionId) return;

    const chargerGroupes = async () => {
      try {
        const groupes = await getMissionGroupes(
          missionId
        );

        const groupesNormalises = asArray(
          groupes
        ).map(normalizeGroupe);

        console.log(
          "[GROUPES] Groupes récupérés depuis la BDD :",
          groupesNormalises
        );

        console.log(
          "[GROUPES] Utilisateurs des groupes :",
          groupesNormalises.map((groupe) => ({
            id: groupe.id,
            nom: groupe.nom,
            users: groupe.users,
            soaId: groupe.soaId,
            conducteurIds:
              groupe.conducteurIds,
          }))
        );

        setGroupesManuels(
          groupesNormalises
        );
      } catch (error) {
        console.error(
          "Erreur lors du chargement des groupes",
          error
        );
      }
    };

    chargerGroupes();
  }, [
    missionId,
    setGroupesManuels,
  ]);

  /*
   * ==========================================
   * UTILISATEURS SÉLECTIONNÉS
   * ==========================================
   */

  const usersSelectionnesSet = useMemo(
    () =>
      new Set(
        asArray(usersSelectionnesIds)
          .map(getUserId)
          .filter(Boolean)
      ),
    [usersSelectionnesIds]
  );

  /*
   * ==========================================
   * NETTOYAGE DES GROUPES EXISTANTS
   * ==========================================
   */

  useEffect(() => {
    setGroupesManuels(
      (groupesActuels) => {
        let hasChanged = false;

        const groupesNettoyes =
          asArray(groupesActuels).map(
            (groupe, index) => {
              const groupeNormalise =
                normalizeGroupe(
                  groupe,
                  index
                );

              const usersValides =
                groupeNormalise.users.filter(
                  (userId) =>
                    usersSelectionnesSet.has(
                      userId
                    )
                );

              const usersIdentiques =
                usersValides.length ===
                  groupeNormalise.users.length &&
                usersValides.every(
                  (
                    userId,
                    userIndex
                  ) =>
                    userId ===
                    groupeNormalise
                      .users[
                      userIndex
                    ]
                );

              if (
                !usersIdentiques ||
                groupeNormalise.id !==
                  groupe.id ||
                groupeNormalise.nom !==
                  groupe.nom
              ) {
                hasChanged = true;

                return {
                  ...groupeNormalise,
                  users: usersValides,
                };
              }

              return groupeNormalise;
            }
          );

        return hasChanged
          ? groupesNettoyes
          : groupesActuels;
      }
    );
  }, [
    setGroupesManuels,
    usersSelectionnesSet,
  ]);

  /*
   * ==========================================
   * CRÉATION AUTOMATIQUE DES GROUPES
   * ==========================================
   */

  useEffect(() => {
    /*
     * Une mission existante possède déjà ses
     * groupes en BDD.
     *
     * On ne doit surtout pas les recréer.
     */
    if (missionId) return;

    if (
      typeof getUsersSection !==
      "function"
    ) {
      return;
    }

    setGroupesManuels(
      (groupesActuels) => {
        const groupesNormalises =
          asArray(groupesActuels).map(
            normalizeGroupe
          );

        const groupesManuelsExistants =
          groupesNormalises.filter(
            (groupe) =>
              !groupe.automatique
          );

        const usersGroupesManuels =
          new Set(
            groupesManuelsExistants.flatMap(
              (groupe) =>
                groupe.users
            )
          );

        const nouveauxGroupesAutomatiques =
          [];

        const sectionsAPlat =
          Array.isArray(
            sectionsSelectionnees
          )
            ? sectionsSelectionnees
            : Object.values(
                sectionsSelectionnees ||
                  {}
              ).flatMap(
                (sections) =>
                  asArray(sections)
              );

        console.log(
          "sectionsSelectionnees",
          sectionsSelectionnees
        );

        console.log(
          "sectionsAPlat",
          sectionsAPlat
        );

        console.log(
          "usersSelectionnesIds",
          usersSelectionnesIds
        );

        sectionsAPlat.forEach(
          (section) => {
            const sectionId =
              typeof section ===
              "object"
                ? section.id
                : section;

            if (
              sectionsIgnorees.includes(
                sectionId
              )
            ) {
              return;
            }

            const usersInSection =
              asArray(
                getUsersSection(
                  sectionId
                )
              );

            if (
              usersInSection.length ===
              0
            ) {
              return;
            }

            const selectedUsersInSection =
              usersInSection
                .map(getUserId)
                .filter(
                  (userId) =>
                    usersSelectionnesSet.has(
                      userId
                    ) &&
                    !usersGroupesManuels.has(
                      userId
                    )
                );

            console.log(
              "section",
              sectionId
            );

            console.log(
              "usersInSection",
              usersInSection
            );

            console.log(
              "selectedUsersInSection",
              selectedUsersInSection
            );

            if (
              selectedUsersInSection.length ===
              0
            ) {
              return;
            }

            nouveauxGroupesAutomatiques.push(
              {
                id: `auto-section-${sectionId}`,

                automatique: true,

                nom:
                  (typeof section ===
                  "object"
                    ? section.sectionName ??
                      section.nom
                    : null) ??
                  `Section ${sectionId}`,

                sectionId,

                compagnieId:
                  typeof section ===
                  "object"
                    ? section.compagnieId ??
                      section.compagnie
                        ?.id ??
                      null
                    : null,

                users:
                  selectedUsersInSection,

                soaId: null,

                conducteurIds: [],
              }
            );
          }
        );

        const resultat = [
          ...groupesManuelsExistants,
          ...nouveauxGroupesAutomatiques,
        ];

        console.log(
          "Groupes générés :",
          resultat
        );

        const identiques =
          resultat.length ===
            groupesNormalises.length &&
          resultat.every(
            (groupe, index) => {
              const actuel =
                groupesNormalises[
                  index
                ];

              if (!actuel) {
                return false;
              }

              return (
                groupe.id ===
                  actuel.id &&
                groupe.nom ===
                  actuel.nom &&
                groupe.automatique ===
                  actuel.automatique &&
                groupe.sectionId ===
                  actuel.sectionId &&
                groupe.compagnieId ===
                  actuel.compagnieId &&
                groupe.users.length ===
                  actuel.users.length &&
                groupe.users.every(
                  (
                    userId,
                    userIndex
                  ) =>
                    userId ===
                    actuel.users[
                      userIndex
                    ]
                )
              );
            }
          );

        return identiques
          ? groupesActuels
          : resultat;
      }
    );
  }, [
    missionId,
    sectionsSelectionnees,
    getUsersSection,
    usersSelectionnesSet,
    setGroupesManuels,
    sectionsIgnorees,
  ]);

  /*
   * ==========================================
   * CRÉER UN GROUPE MANUEL
   * ==========================================
   */

  const creerGroupeManuel = () => {
    setGroupesManuels(
      (groupesActuels) => {
        const groupes = asArray(
          groupesActuels
        ).map(normalizeGroupe);

        return [
          ...groupes,

          {
            id: createGroupId(),

            nom: `Groupe ${
              groupes.length + 1
            }`,

            ordre:
              groupes.length + 1,

            soaId: null,

            conducteurIds: [],

            users: [],
          },
        ];
      }
    );
  };

  /*
   * ==========================================
   * SUPPRIMER UN GROUPE
   * ==========================================
   */

  const supprimerGroupeManuel = (
    groupeIndex
  ) => {
    setGroupesManuels(
      (groupesActuels) => {
        const groupes = asArray(
          groupesActuels
        );

        const groupeToRemove =
          normalizeGroupe(
            groupes[groupeIndex],
            groupeIndex
          );

        if (
          groupeToRemove.automatique &&
          groupeToRemove.sectionId
        ) {
          setSectionsIgnorees(
            (prev) => {
              if (
                prev.includes(
                  groupeToRemove.sectionId
                )
              ) {
                return prev;
              }

              return [
                ...prev,
                groupeToRemove.sectionId,
              ];
            }
          );
        }

        return groupes.filter(
          (_, index) =>
            index !== groupeIndex
        );
      }
    );
  };

  /*
   * ==========================================
   * RENOMMER UN GROUPE
   * ==========================================
   */

  const renommerGroupe = (
    groupeIndex,
    nom
  ) => {
    setGroupesManuels(
      (groupesActuels) =>
        asArray(groupesActuels).map(
          (groupe, index) =>
            index === groupeIndex
              ? {
                  ...normalizeGroupe(
                    groupe,
                    index
                  ),
                  nom,
                }
              : normalizeGroupe(
                  groupe,
                  index
                )
        )
    );
  };

  /*
   * ==========================================
   * SOA
   * ==========================================
   */

  const setSoa = (
    groupeIndex,
    userId
  ) => {
    setGroupesManuels(
      (groupesActuels) =>
        asArray(groupesActuels).map(
          (groupe, index) =>
            index === groupeIndex
              ? {
                  ...normalizeGroupe(
                    groupe,
                    index
                  ),
                  soaId: userId,
                }
              : normalizeGroupe(
                  groupe,
                  index
                )
        )
    );
  };

  /*
   * ==========================================
   * CONDUCTEURS
   * ==========================================
   */

  const toggleConducteur = (
    groupeIndex,
    userId
  ) => {
    setGroupesManuels(
      (groupesActuels) =>
        asArray(groupesActuels).map(
          (groupe, index) => {
            const groupeNormalise =
              normalizeGroupe(
                groupe,
                index
              );

            if (
              index !== groupeIndex
            ) {
              return groupeNormalise;
            }

            const conducteurIds =
              new Set(
                groupeNormalise.conducteurIds
              );

            if (
              conducteurIds.has(
                userId
              )
            ) {
              conducteurIds.delete(
                userId
              );
            } else {
              conducteurIds.add(
                userId
              );
            }

            return {
              ...groupeNormalise,

              conducteurIds: [
                ...conducteurIds,
              ],
            };
          }
        )
    );
  };

  /*
   * ==========================================
   * UTILISATEURS DANS UN GROUPE
   * ==========================================
   */

  const toggleUserDansGroupe = (
    groupeIndex,
    userId
  ) => {
    if (
      !usersSelectionnesSet.has(
        userId
      )
    ) {
      return;
    }

    setGroupesManuels(
      (groupesActuels) => {
        const groupes = asArray(
          groupesActuels
        ).map(normalizeGroupe);

        return groupes.map(
          (groupe, index) => {
            const usersSet =
              new Set(
                groupe.users
              );

            if (
              index === groupeIndex
            ) {
              if (
                usersSet.has(
                  userId
                )
              ) {
                usersSet.delete(
                  userId
                );
              } else {
                usersSet.add(
                  userId
                );
              }
            } else {
              usersSet.delete(
                userId
              );
            }

            return {
              ...groupe,

              users: [
                ...usersSet,
              ],
            };
          }
        );
      }
    );
  };

  const groupesNormalises =
    asArray(groupesManuels).map(
      normalizeGroupe
    );

  return {
    groupes:
      groupesNormalises,

    groupesManuels:
      groupesNormalises,

    creerGroupeManuel,

    supprimerGroupeManuel,

    renommerGroupe,

    setSoa,

    toggleConducteur,

    toggleUserDansGroupe,
  };
}
