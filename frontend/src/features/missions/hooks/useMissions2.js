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

  const sectionsSelectionneesGroupes = Object.entries(
    compagnies.sectionsSelectionnees || {},
  ).flatMap(([compagnieId, sections]) =>
    [...sections].map((section) =>
      typeof section === "object"
        ? section
        : {
            id: section,
            compagnieId,
          },
    ),
  );

  const groupes = useGroupesMissions2({
    usersSelectionnesIds: personnel.tousUsersSelectionnesIds,
    sectionsSelectionnees: sectionsSelectionneesGroupes,
    getUsersSection: personnel.getUsersSection,
  });

  const usersDisponibles = personnel.tousUsersSelectionnesIds
    .map((userId) => personnel.getUser(userId))
    .filter(Boolean);

  const { vehicules: listeVehicules = [] } = useVehicules();

  const vehicules = useMissionsVehicules(listeVehicules);

  /*
   * ==========================================
   * GROUPES POUR L'ÉTAPE 3
   * ==========================================
   *
   * On crée une entrée par groupe et non
   * une entrée par compagnie.
   *
   * Une même compagnie peut donc avoir :
   *
   *   Groupe 1 → véhicules
   *   Groupe 2 → véhicules
   *   Groupe 3 → véhicules
   */

  const compagniesSelectionneesGroupes = (groupes.groupes ?? []).map(
    (groupe, index) => {
      const compagnieId =
        groupe.compagnieId ?? groupe.section?.compagnieId ?? null;

      const compagnie = compagnies.compagnies.find(
        (item) => item.id === compagnieId,
      );

      return {
        groupeId: groupe.id ?? groupe.groupeId ?? `groupe-${index}`,

        nomGroupe: groupe.automatique
          ? (groupe.sectionName ??
            groupe.section?.sectionName ??
            groupe.nom ??
            `Section ${index + 1}`)
          : (groupe.nomGroupe ?? groupe.nom ?? `Groupe ${index + 1}`),

        compagnieId,

        nomCompagnie:
          groupe.nomCompagnie ??
          groupe.compagnie?.nom ??
          compagnie?.nom ??
          "Compagnie",

        sectionId: groupe.sectionId ?? groupe.section?.id ?? null,
      };
    },
  );

  return {
    ...mission,
    ...compagnies,
    ...personnel,
    ...groupes,
    ...vehicules,

    usersDisponibles,

    compagniesSelectionneesGroupes,
  };
}
