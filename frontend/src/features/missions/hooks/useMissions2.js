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

  const compagniesSelectionneesGroupes = compagnies.compagnies
    .filter((compagnie) =>
      compagnies.compagniesSelectionneesIds.includes(compagnie.id),
    )
    .map((compagnie) => ({
      compagnieId: compagnie.id,
      nomCompagnie: compagnie.nom,
    }));

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
