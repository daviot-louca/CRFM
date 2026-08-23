import { useEffect, useMemo } from "react";
import { useMission } from "../context/useMission";
import {
  getMissionGroupes,
  createMissionGroupe,
} from "../api/missions.api";

const asArray = (value) => {
  if (Array.isArray(value)) return value;
  if (value instanceof Set) return [...value];
  return [];
};

const createGroupId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `groupe-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const normalizeGroupe = (groupe, index) => ({
  ...groupe,
  id: groupe.id ?? createGroupId(),
  nom: groupe.nom ?? `Groupe ${index + 1}`,
  users: asArray(groupe.users ?? groupe.userIds),
  soaId: groupe.soaId ?? null,
  conducteurIds: asArray(groupe.conducteurIds),
});

export function useGroupesMissions2({
  missionId,
  usersSelectionnesIds = [],
  sectionsSelectionnees = [],
  getUsersSection,
} = {}) {
  const { groupesManuels, setGroupesManuels, sectionsIgnorees, setSectionsIgnorees } = useMission();

  useEffect(() => {
    if (!missionId) return;

    const chargerGroupes = async () => {
      try {
        const groupes = await getMissionGroupes(missionId);
        setGroupesManuels(groupes);
      } catch (error) {
        console.error("Erreur lors du chargement des groupes", error);
      }
    };

    chargerGroupes();
  }, [missionId, setGroupesManuels]);

  const usersSelectionnesSet = useMemo(
    () => new Set(asArray(usersSelectionnesIds)),
    [usersSelectionnesIds]
  );

  useEffect(() => {
    setGroupesManuels((groupesActuels) => {
      let hasChanged = false;

      const groupesNettoyes = asArray(groupesActuels).map((groupe, index) => {
        const groupeNormalise = normalizeGroupe(groupe, index);
        const usersValides = groupeNormalise.users.filter((userId) =>
          usersSelectionnesSet.has(userId)
        );

        if (
          usersValides.length !== groupeNormalise.users.length ||
          groupeNormalise.id !== groupe.id ||
          groupeNormalise.nom !== groupe.nom
        ) {
          hasChanged = true;
          return { ...groupeNormalise, users: usersValides };
        }

        return groupeNormalise;
      });

      return hasChanged ? groupesNettoyes : groupesActuels;
    });
  }, [setGroupesManuels, usersSelectionnesSet]);

  useEffect(() => {
    // When editing an existing mission loaded from the backend,
    // do not generate automatic groups.
    if (missionId) return;

    if (typeof getUsersSection !== "function") return;

    setGroupesManuels((groupesActuels) => {
      const groupesNormalises = asArray(groupesActuels).map(normalizeGroupe);
      const groupesManuelsExistants = groupesNormalises.filter(
        (groupe) => !groupe.automatique
      );

      const usersGroupesManuels = new Set(
        groupesManuelsExistants.flatMap((groupe) => groupe.users)
      );

      const nouveauxGroupesAutomatiques = [];
      const sectionsAPlat = Array.isArray(sectionsSelectionnees)
        ? sectionsSelectionnees
        : Object.values(sectionsSelectionnees || {}).flatMap((sections) =>
            asArray(sections)
          );

      console.log("sectionsSelectionnees", sectionsSelectionnees);
      console.log("sectionsAPlat", sectionsAPlat);
      console.log("usersSelectionnesIds", usersSelectionnesIds);

      sectionsAPlat.forEach((section) => {
        const sectionId = typeof section === "object" ? section.id : section;
        if (sectionsIgnorees.includes(sectionId)) {
          return;
        }
        const usersInSection = asArray(getUsersSection(sectionId));
        if (usersInSection.length === 0) return;

        const selectedUsersInSection = usersInSection
          .map((user) => (typeof user === "object" ? user.id : user))
          .filter(
            (userId) =>
              usersSelectionnesSet.has(userId) && !usersGroupesManuels.has(userId)
          );
        console.log("section", sectionId);
        console.log("usersInSection", usersInSection);
        console.log("selectedUsersInSection", selectedUsersInSection);
        if (selectedUsersInSection.length === 0) {
          return;
        }

        nouveauxGroupesAutomatiques.push({
          id: `auto-section-${sectionId}`,
          automatique: true,
          nom:
            (typeof section === "object"
              ? section.sectionName ?? section.nom
              : null) ?? `Section ${sectionId}`,
          sectionId,
          compagnieId:
            typeof section === "object"
              ? section.compagnieId ?? section.compagnie?.id ?? null
              : null,
          users: selectedUsersInSection,
          soaId: null,
          conducteurIds: [],
        });
      });

      const resultat = [...groupesManuelsExistants, ...nouveauxGroupesAutomatiques];
      console.log("Groupes générés :", resultat);

      const identiques =
        resultat.length === groupesNormalises.length &&
        resultat.every((groupe, index) => {
          const actuel = groupesNormalises[index];
          if (!actuel) return false;

          return (
            groupe.id === actuel.id &&
            groupe.nom === actuel.nom &&
            groupe.automatique === actuel.automatique &&
            groupe.sectionId === actuel.sectionId &&
            groupe.compagnieId === actuel.compagnieId &&
            groupe.users.length === actuel.users.length &&
            groupe.users.every((userId, i) => userId === actuel.users[i])
          );
        });

      return identiques ? groupesActuels : resultat;
    });
  }, [missionId, sectionsSelectionnees, getUsersSection, usersSelectionnesSet, setGroupesManuels, sectionsIgnorees]);

  const creerGroupeManuel = () => {
    setGroupesManuels((groupesActuels) => {
      const groupes = asArray(groupesActuels).map(normalizeGroupe);

      return [
        ...groupes,
        {
          id: createGroupId(),
          nom: `Groupe ${groupes.length + 1}`,
          ordre: groupes.length + 1,
          soaId: null,
          conducteurIds: [],
          users: [],
        },
      ];
    });
  };

  const supprimerGroupeManuel = (groupeIndex) => {
    setGroupesManuels((groupesActuels) => {
      const groupes = asArray(groupesActuels);
      const groupeToRemove = normalizeGroupe(groupes[groupeIndex], groupeIndex);
      if (groupeToRemove.automatique && groupeToRemove.sectionId) {
        setSectionsIgnorees((prev) => {
          if (prev.includes(groupeToRemove.sectionId)) {
            return prev;
          }
          return [...prev, groupeToRemove.sectionId];
        });
      }
      return groupes.filter((_, index) => index !== groupeIndex);
    });
  };

  const renommerGroupe = (groupeIndex, nom) => {
    setGroupesManuels((groupesActuels) =>
      asArray(groupesActuels).map((groupe, index) =>
        index === groupeIndex ? { ...normalizeGroupe(groupe, index), nom } : normalizeGroupe(groupe, index)
      )
    );
  };

  const setSoa = (groupeIndex, userId) => {
    setGroupesManuels((groupesActuels) =>
      asArray(groupesActuels).map((groupe, index) =>
        index === groupeIndex
          ? {
              ...normalizeGroupe(groupe, index),
              soaId: userId,
            }
          : normalizeGroupe(groupe, index)
      )
    );
  };

  const toggleConducteur = (groupeIndex, userId) => {
    setGroupesManuels((groupesActuels) =>
      asArray(groupesActuels).map((groupe, index) => {
        const groupeNormalise = normalizeGroupe(groupe, index);

        if (index !== groupeIndex) {
          return groupeNormalise;
        }

        const conducteurIds = new Set(groupeNormalise.conducteurIds);

        if (conducteurIds.has(userId)) {
          conducteurIds.delete(userId);
        } else {
          conducteurIds.add(userId);
        }

        return {
          ...groupeNormalise,
          conducteurIds: [...conducteurIds],
        };
      })
    );
  };

  const toggleUserDansGroupe = (groupeIndex, userId) => {
    if (!usersSelectionnesSet.has(userId)) return;

    setGroupesManuels((groupesActuels) => {
      const groupes = asArray(groupesActuels).map(normalizeGroupe);
      return groupes.map((groupe, index) => {
        const usersSet = new Set(groupe.users);
        if (index === groupeIndex) {
          if (usersSet.has(userId)) {
            usersSet.delete(userId);
          } else {
            usersSet.add(userId);
          }
        } else {
          usersSet.delete(userId);
        }
        return { ...groupe, users: [...usersSet] };
      });
    });
  };

  return {
    groupesManuels: asArray(groupesManuels).map(normalizeGroupe),
    creerGroupeManuel,
    supprimerGroupeManuel,
    renommerGroupe,
    setSoa,
    toggleConducteur,
    toggleUserDansGroupe,
  };
}
