import { useCompagniesMissions2 } from "./useCompagniesMissions2";
import { usePersonnelMissions2 } from "./usePersonnelMissions2";
import { useGroupesMissions2 } from "./useGroupesMissions2";
import { useMissionsVehicules } from "./useMissionsVehicules";
import { useVehicules } from "../../vehicules/hooks/useVehiculesdispo";
import { useMission } from "../context/useMission";

export function useMissions2() {
  const mission = useMission();

  /*
   * ==========================================
   * UTILISATEURS DE LA MISSION
   * ==========================================
   *
   * Le contexte contient directement les
   * utilisateurs complets dans usersMission.
   *
   * Si usersMission n'est pas encore exposé,
   * on récupère les users depuis missionsUsers.
   */

  const usersMission = Array.isArray(
    mission?.usersMission,
  )
    ? mission.usersMission
    : Array.isArray(
        mission?.missionsUsers,
      )
      ? mission.missionsUsers
          .map(
            (missionUser) =>
              missionUser?.user ??
              null,
          )
          .filter(Boolean)
      : [];

  /*
   * ==========================================
   * COMPAGNIES
   * ==========================================
   */

  const compagnies =
    useCompagniesMissions2();

  /*
   * ==========================================
   * PERSONNEL
   * ==========================================
   */

  const personnel =
    usePersonnelMissions2(
      compagnies.compagniesSelectionneesIds,
      compagnies.sectionsSelectionnees,
    );

  /*
   * ==========================================
   * SECTIONS POUR LES GROUPES
   * ==========================================
   */

  const sectionsSelectionneesGroupes =
    Object.entries(
      compagnies.sectionsSelectionnees ||
        {},
    ).flatMap(
      ([compagnieId, sections]) =>
        [...sections].map(
          (section) =>
            typeof section ===
            "object"
              ? section
              : {
                  id: section,
                  compagnieId,
                },
        ),
    );

  /*
   * ==========================================
   * GROUPES
   * ==========================================
   */

  const groupes =
    useGroupesMissions2({
      usersSelectionnesIds:
        personnel.tousUsersSelectionnesIds,

      sectionsSelectionnees:
        sectionsSelectionneesGroupes,

      getUsersSection:
        personnel.getUsersSection,
    });

  /*
   * ==========================================
   * UTILISATEURS DISPONIBLES
   * ==========================================
   *
   * Les utilisateurs sont déjà ceux affectés
   * à la mission.
   *
   * Aucun filtrage par usersParSection.
   */

  const usersDisponibles =
    usersMission;

  /*
   * ==========================================
   * CONDUCTEURS
   * ==========================================
   *
   * Peuvent conduire :
   *
   * - CONDUCTEUR
   * - SOA
   * - OA
   *
   * On accepte role.roleName mais aussi
   * roleName directement si l'API renvoie
   * cette forme.
   */

  const conducteurs =
    usersDisponibles.filter(
      (user) => {
        const roleName =
          String(
            user?.role?.roleName ??
              user?.roleName ??
              "",
          )
            .trim()
            .toUpperCase();

        return (
          roleName ===
            "CONDUCTEUR" ||
          roleName === "SOA" ||
          roleName === "OA"
        );
      },
    );

  console.log(
    "[useMissions2] usersMission :",
    usersMission,
  );

  console.log(
    "[useMissions2] usersDisponibles :",
    usersDisponibles,
  );

  console.log(
    "[useMissions2] conducteurs :",
    conducteurs,
  );

  console.log(
    "[ÉTAPE 5] PREMIER USER :",
    usersMission?.[0],
  );

  console.log(
    "[ÉTAPE 5] PREMIER ROLE :",
    usersMission?.[0]?.role,
  );

  console.log(
    "[ÉTAPE 5] PREMIER ROLE NAME :",
    usersMission?.[0]?.role?.roleName ??
      usersMission?.[0]?.roleName,
  );
  console.log(
    "[ÉTAPE 5] PREMIER USER KEYS :",
    usersMission?.[0]
      ? Object.keys(usersMission[0])
      : [],
  );
  
  console.log(
    "[ÉTAPE 5] PREMIER USER JSON :",
    usersMission?.[0]
      ? JSON.parse(JSON.stringify(usersMission[0]))
      : null,
  );console.log(
    "[ÉTAPE 5] KEYS PREMIER USER :",
    Object.keys(usersMission?.[0] ?? {})
  );
  
  console.log(
    "[ÉTAPE 5] PREMIER USER COMPLET :",
    usersMission?.[0]
  );
  /*
   * ==========================================
   * VÉHICULES
   * ==========================================
   */

  const {
    vehicules:
      listeVehicules = [],
  } = useVehicules();

  const vehicules =
    useMissionsVehicules(
      listeVehicules,
    );

  /*
   * ==========================================
   * GROUPES POUR L'ÉTAPE 3
   * ==========================================
   */

  const compagniesSelectionneesGroupes =
    (
      groupes.groupes ?? []
    ).map(
      (groupe, index) => {
        const compagnieId =
          groupe.compagnieId ??
          groupe.section
            ?.compagnieId ??
          null;

        const compagnie =
          compagnies.compagnies.find(
            (item) =>
              item.id ===
              compagnieId,
          );

        return {
          groupeId:
            groupe.id ??
            groupe.groupeId ??
            `groupe-${index}`,

          nomGroupe:
            groupe.automatique
              ? groupe.sectionName ??
                groupe.section
                  ?.sectionName ??
                groupe.nom ??
                `Section ${
                  index + 1
                }`
              : groupe.nomGroupe ??
                groupe.nom ??
                `Groupe ${
                  index + 1
                }`,

          compagnieId,

          nomCompagnie:
            groupe.nomCompagnie ??
            groupe.compagnie
              ?.nom ??
            compagnie?.nom ??
            "Compagnie",

          sectionId:
            groupe.sectionId ??
            groupe.section?.id ??
            null,
        };
      },
    );

  /*
   * ==========================================
   * VÉHICULES SÉLECTIONNÉS
   * ==========================================
   */

  const vehiculesSelectionnesContext =
    Array.isArray(
      mission?.vehiculesSelectionnes,
    )
      ? mission.vehiculesSelectionnes
      : [];

  const vehiculesSelectionnesHook =
    Array.isArray(
      vehicules?.vehiculesSelectionnes,
    )
      ? vehicules.vehiculesSelectionnes
      : [];

  const vehiculesSelectionnes =
    vehiculesSelectionnesContext.length >
    0
      ? vehiculesSelectionnesContext
      : vehiculesSelectionnesHook;

  /*
   * ==========================================
   * IDS DES VÉHICULES SÉLECTIONNÉS
   * ==========================================
   */

  const idsVehiculesSelectionnes =
    new Set(
      vehiculesSelectionnes
        .map(
          (selection) => {
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
          },
        )
        .filter(Boolean)
        .map(String),
    );

  /*
   * ==========================================
   * VÉHICULES DÉJÀ DANS LA MISSION
   * ==========================================
   */

  const vehiculesMission =
    Array.isArray(
      mission?.vehicules,
    )
      ? mission.vehicules
      : [];

  const vehiculesMissionSelectionnes =
    vehiculesMission.filter(
      (vehicule) =>
        idsVehiculesSelectionnes.has(
          String(
            vehicule?.id ??
              vehicule?.vehiculeId,
          ),
        ),
    );

  /*
   * ==========================================
   * VÉHICULES DISPONIBLES
   * ==========================================
   */

  const vehiculesDisponiblesSelectionnes =
    (
      Array.isArray(
        listeVehicules,
      )
        ? listeVehicules
        : []
    ).filter(
      (vehicule) =>
        idsVehiculesSelectionnes.has(
          String(
            vehicule?.id ??
              vehicule?.vehiculeId,
          ),
        ),
    );

  /*
   * ==========================================
   * VÉHICULES DIRECTS
   * ==========================================
   */

  const vehiculesDirects =
    vehiculesSelectionnes
      .map(
        (selection) => {
          if (
            selection?.vehicule &&
            typeof selection.vehicule ===
              "object"
          ) {
            return selection.vehicule;
          }

          return null;
        },
      )
      .filter(Boolean);

  /*
   * ==========================================
   * FUSION DES VÉHICULES
   * ==========================================
   */

  const vehiculesSelectionnesComplets =
    [
      ...vehiculesMissionSelectionnes,
      ...vehiculesDisponiblesSelectionnes,
      ...vehiculesDirects,
    ];

  /*
   * ==========================================
   * SUPPRESSION DES DOUBLONS
   * ==========================================
   */

  const vehiculesSelectionnesUniques =
    [
      ...new Map(
        vehiculesSelectionnesComplets
          .filter(Boolean)
          .map(
            (vehicule) => [
              String(
                vehicule?.id ??
                  vehicule?.vehiculeId ??
                  vehicule?.vehicule
                    ?.id,
              ),
              vehicule,
            ],
          ),
      ).values(),
    ];

  /*
   * ==========================================
   * DEBUG
   * ==========================================
   */

  console.log(
    "mission.vehicules",
    vehiculesMission,
  );

  console.log(
    "==============================================",
  );

  /*
   * ==========================================
   * RETOUR
   * ==========================================
   */

  return {
    /*
     * Mission
     */

    ...mission,

    /*
     * Compagnies
     */

    ...compagnies,

    /*
     * Personnel
     */

    ...personnel,

    /*
     * Groupes
     */

    ...groupes,

    /*
     * Véhicules
     */

    ...vehicules,

    /*
     * Utilisateurs de la mission
     */

    usersMission,

    usersDisponibles,

    conducteurs,

    /*
     * Véhicules sélectionnés
     */

    vehiculesSelectionnes,

    vehiculesSelectionnesComplets:
      vehiculesSelectionnesUniques,

    /*
     * Groupes utilisés par l'étape 3
     */

    compagniesSelectionneesGroupes,
  };
}