import { useEffect, useMemo, useState } from "react";
import { useMission } from "../context/useMission";
import * as missionsApi from "../api/missions.api";

/**
 * Hook for managing personnel selection by section for missions.
 * @param {Array} compagniesSelectionneesIds - Array of selected company ids (not used here, but kept for signature compatibility).
 * @param {Object<string, Set>} sectionsSelectionnees - Object keyed by compagnie id, each value is a Set of section ids.
 */
export function usePersonnelMissions2(compagniesSelectionneesIds, sectionsSelectionnees) {
  // { [sectionId]: Array<user> }
  const [usersParSection, setUsersParSection] = useState({});
  // Selection state from context
  const {
    usersSelectionnes,
    setUsersSelectionnes,
  } = useMission();
  const [recherchePersonnel, setRecherchePersonnel] = useState("");
  const [chargementUsers, setChargementUsers] = useState({});
  const [tousLesUsers, setTousLesUsers] = useState([]);
  const sectionIdsSelectionnees = useMemo(
    () =>
      Object.values(sectionsSelectionnees || {})
        .flatMap((sections) =>
          Array.from(sections).map((section) =>
            typeof section === "object" ? section.id : section
          )
        )
        .filter(Boolean),
    [sectionsSelectionnees]
  );

  useEffect(() => {
    let isMounted = true;

    async function loadUsers() {
      const sectionIdsToLoad = sectionIdsSelectionnees.filter(
        (id) => !(id in usersParSection)
      );

      if (sectionIdsToLoad.length === 0) {
        return;
      }

      setChargementUsers((prev) => ({
        ...prev,
        ...Object.fromEntries(sectionIdsToLoad.map((sectionId) => [sectionId, true])),
      }));

      const promises = sectionIdsToLoad.map(async (sectionId) => {
        try {
          const users = await missionsApi.getUsersBySection(sectionId);
          return { sectionId, users };
        } catch (err) {
          console.error("Impossible de charger les militaires de la section :", err);
          return { sectionId, users: [] };
        }
      });

      const results = await Promise.all(promises);
      if (!isMounted) return;

      setUsersParSection((prev) => {
        const next = { ...prev };
        results.forEach(({ sectionId, users }) => {
          next[sectionId] = users;
        });
        return next;
      });
      setTousLesUsers((prev) => {
        const map = new Map(
          prev.map((user) => [user.id, user])
        );
      
        results.forEach(({ users }) => {
          users.forEach((user) => {
            map.set(user.id, user);
          });
        });
      
        return Array.from(map.values());
      });
      setChargementUsers((prev) => ({
        ...prev,
        ...Object.fromEntries(results.map(({ sectionId }) => [sectionId, false])),
      }));
    }

    loadUsers();

    return () => {
      isMounted = false;
    };
  }, [sectionIdsSelectionnees]);

  // Toggle a user's selection in a section
  function toggleUser(sectionId, userId) {
    setUsersSelectionnes((prev) => {
      const prevSet = prev[sectionId] || new Set();
      const newSet = new Set(prevSet);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return { ...prev, [sectionId]: newSet };
    });
  }

  // Select or unselect all users in a section
  function selectAllUsers(sectionId) {
    setUsersSelectionnes((prev) => {
      const users = usersParSection[sectionId] || [];
      const allUserIds = users.map((u) => u.id);
      const prevSet = prev[sectionId] || new Set();
      const allSelected = allUserIds.every((id) => prevSet.has(id));
      return {
        ...prev,
        [sectionId]: allSelected ? new Set() : new Set(allUserIds),
      };
    });
  }

  // Memoized flat array of all selected user ids
  const tousUsersSelectionnesIds = useMemo(() => {
    return Object.values(usersSelectionnes).reduce(
      (acc, set) => acc.concat(Array.from(set)),
      []
    );
  }, [usersSelectionnes]);

  // Get user object by id from loaded users
  function getUser(userId) {
    return tousLesUsers.find(
      (user) => user.id === userId
    );
  }

  function getUsersSection(sectionId) {
    return (usersParSection[sectionId] || []).map((user) => user.id);
  }
  return {
    tousLesUsers,
    usersParSection,
    usersSelectionnes,
    recherchePersonnel,
    setRecherchePersonnel,
    chargementUsers,
    toggleUser,
    selectAllUsers,
    tousUsersSelectionnesIds,
    getUser,
    getUsersSection,
  };
}
