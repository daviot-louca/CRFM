import { useCompagniesMissions2 } from "./useCompagniesMissions2";
import { usePersonnelMissions2 } from "./usePersonnelMissions2";
import { useGroupesMissions2 } from "./useGroupesMissions2";
import { useMissionsVehicules } from "./useMissionsVehicules";
import { useVehicules } from "../../vehicules/hooks/useVehiculesdispo";
import { useMission } from "../context/useMission";

export function useMissions2() {
  const mission = useMission();

  const compagnies = useCompagniesMissions2();

  const personnel = usePersonnelMissions2(
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
      compagnies.sectionsSelectionnees || {},
    ).flatMap(
      ([compagnieId, sections]) =>
        [...sections].map((section) =>
          typeof section === "object"
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

  const groupes = useGroupesMissions2({
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
   */

  const usersDisponibles =
    personnel.tousUsersSelectionnesIds
      .map((userId) =>
        personnel.getUser(userId),
      )
      .filter(Boolean);

  /*
   * ==========================================
   * VÉHICULES
   * ==========================================
   */

  const {
    vehicules: listeVehicules = [],
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
    (groupes.groupes ?? []).map(
      (groupe, index) => {
        const compagnieId =
          groupe.compagnieId ??
          groupe.section?.compagnieId ??
          null;

        const compagnie =
          compagnies.compagnies.find(
            (item) =>
              item.id === compagnieId,
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
                `Section ${index + 1}`
              : groupe.nomGroupe ??
                groupe.nom ??
                `Groupe ${index + 1}`,

          compagnieId,

          nomCompagnie:
            groupe.nomCompagnie ??
            groupe.compagnie?.nom ??
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
   *
   * On récupère d'abord les affectations provenant
   * du contexte / hook.
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
    vehiculesSelectionnesContext.length > 0
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
        .map((selection) => {
          if (
            typeof selection === "string"
          ) {
            return selection;
          }

          return (
            selection?.vehiculeId ??
            selection?.vehicule?.id ??
            selection?.id ??
            null
          );
        })
        .filter(Boolean)
        .map(String),
    );

  /*
   * ==========================================
   * VÉHICULES DÉJÀ DANS LA MISSION
   * ==========================================
   *
   * C'est cette source qui est importante lorsque
   * le véhicule n'est plus présent dans la liste
   * des véhicules disponibles.
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
   *
   * On les utilise seulement s'ils sont encore
   * présents dans la liste globale.
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
   * VÉHICULES DIRECTEMENT CONTENUS DANS
   * LES SÉLECTIONS
   * ==========================================
   */

  const vehiculesDirects =
    vehiculesSelectionnes
      .map((selection) => {
        if (
          selection?.vehicule &&
          typeof selection.vehicule ===
            "object"
        ) {
          return selection.vehicule;
        }

        return null;
      })
      .filter(Boolean);

  /*
   * ==========================================
   * FUSION
   * ==========================================
   */

  const vehiculesSelectionnesComplets = [
    ...vehiculesMissionSelectionnes,
    ...vehiculesDisponiblesSelectionnes,
    ...vehiculesDirects,
  ];

  /*
   * ==========================================
   * SUPPRESSION DES DOUBLONS
   * ==========================================
   */

  const vehiculesSelectionnesUniques = [
    ...new Map(
      vehiculesSelectionnesComplets
        .filter(Boolean)
        .map((vehicule) => [
          String(
            vehicule?.id ??
              vehicule?.vehiculeId ??
              vehicule?.vehicule?.id,
          ),
          vehicule,
        ]),
    ).values(),
  ];

  /*
   * ==========================================
   * DEBUG
   * ==========================================
   */

  console.log(
    "========== [useMissions2] VÉHICULES ==========",
  );

  console.log(
    "[useMissions2] mission :",
    mission,
  );

  console.log(
    "[useMissions2] mission.vehicules :",
    vehiculesMission,
  );

  console.log(
    "[useMissions2] vehiculesSelectionnes :",
    vehiculesSelectionnes,
  );

  console.log(
    "[useMissions2] IDs véhicules sélectionnés :",
    [...idsVehiculesSelectionnes],
  );

  console.log(
    "[useMissions2] véhicules mission sélectionnés :",
    vehiculesMissionSelectionnes,
  );

  console.log(
    "[useMissions2] véhicules disponibles sélectionnés :",
    vehiculesDisponiblesSelectionnes,
  );

  console.log(
    "[useMissions2] véhicules complets FINALS :",
    vehiculesSelectionnesUniques,
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
     * Contexte mission
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
     * ==========================================
     * VÉHICULES SÉLECTIONNÉS
     * ==========================================
     *
     * On conserve les affectations de l'étape 3.
     */

    vehiculesSelectionnes,

    /*
     * ==========================================
     * VÉHICULES COMPLETS
     * ==========================================
     *
     * L'étape 4 peut utiliser cette propriété
     * pour récupérer le nom, type, immatriculation,
     * etc.
     */

    vehiculesSelectionnesComplets:
      vehiculesSelectionnesUniques,

    /*
     * Utilisateurs disponibles
     */

    usersDisponibles,

    /*
     * Groupes utilisés par l'étape 3
     */

    compagniesSelectionneesGroupes,
  };
}