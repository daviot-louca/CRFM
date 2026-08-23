import { useEffect, useMemo, useState } from "react";
import { useCompagnies } from "../../compagnies/hooks/useCompagnies";
import { getSectionsByCompagnie } from "../api/missions.api";
import { useMission } from "../context/useMission";

export function useCompagniesMissions2() {
  const { compagnies, loading, error } = useCompagnies();

  const {
    compagniesSelectionneesIds,
    setCompagniesSelectionneesIds,
    sectionsSelectionnees,
    setSectionsSelectionnees,
    setSectionsIgnorees,
  } = useMission();

  const [rechercheCompagnie, setRechercheCompagnie] = useState("");
  const [compagnieActiveId, setCompagnieActiveId] = useState(null);

  const [sectionsParCompagnie, setSectionsParCompagnie] = useState({});
  const [chargementSections, setChargementSections] = useState({});

  const compagniesFiltrees = useMemo(() => {
    const recherche = rechercheCompagnie.toLowerCase().trim();

    if (!recherche) return compagnies;

    return compagnies.filter((compagnie) =>
      compagnie.nom.toLowerCase().includes(recherche)
    );
  }, [compagnies, rechercheCompagnie]);

  const getCompagnie = (id) =>
    compagnies.find((compagnie) => compagnie.id === id);

  const toggleCompagnie = (compagnieId) => {
    setCompagniesSelectionneesIds((old) => {
      if (old.includes(compagnieId)) {
        const nouveau = old.filter((id) => id !== compagnieId);

        setSectionsSelectionnees((sections) => {
          const copie = { ...sections };
          delete copie[compagnieId];
          return copie;
        });

        return nouveau;
      }

      return [...old, compagnieId];
    });
  };

  const toggleSection = (compagnieId, section) => {
    setSectionsSelectionnees((old) => {
      const selection = [...(old[compagnieId] || [])];

      const index = selection.findIndex((s) =>
        (typeof s === "object" ? s.id : s) === section.id
      );

      if (index !== -1) {
        selection.splice(index, 1);
      } else {
        setSectionsIgnorees((old) =>
          old.filter((id) => id !== section.id)
        );
        selection.push(section);
      }

      return {
        ...old,
        [compagnieId]: selection,
      };
    });
  };

  useEffect(() => {
    compagniesSelectionneesIds.forEach(async (compagnieId) => {
      if (sectionsParCompagnie[compagnieId]) return;

      try {
        setChargementSections((old) => ({
          ...old,
          [compagnieId]: true,
        }));

        const sections = await getSectionsByCompagnie(compagnieId);

        setSectionsParCompagnie((old) => ({
          ...old,
          [compagnieId]: sections,
        }));
      } catch (error) {
        console.error(error);
      } finally {
        setChargementSections((old) => ({
          ...old,
          [compagnieId]: false,
        }));
      }
    });
  }, [compagniesSelectionneesIds, sectionsParCompagnie]);

  return {
    compagnies,
    loading,
    error,
    rechercheCompagnie,
    setRechercheCompagnie,
    compagniesFiltrees,
    compagniesSelectionneesIds,
    compagnieActiveId,
    setCompagnieActiveId,
    sectionsParCompagnie,
    setSectionsParCompagnie,
    sectionsSelectionnees,
    chargementSections,
    toggleCompagnie,
    toggleSection,
    getCompagnie,
  };
}
