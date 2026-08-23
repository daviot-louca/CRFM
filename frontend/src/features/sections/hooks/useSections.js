import { useCallback, useEffect, useState } from "react";
import {
  getSectionsByCompagnie,
  createSection,
  updateSection,
  deleteSection,
} from "../api/sections.api";

export function useSections(compagnieId) {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(Boolean(compagnieId));
  const [error, setError] = useState(null);

  const fetchSections = useCallback(async () => {
    if (!compagnieId) {
      setSections([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getSectionsByCompagnie(compagnieId);
      setSections(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [compagnieId]);

  const addSection = async (sectionData) => {
    const newSection = await createSection({ ...sectionData, compagnieId });
    await fetchSections();
    return newSection;
  };

  const editSection = async (sectionId, sectionData) => {
    const updatedSection = await updateSection(sectionId, sectionData);
    await fetchSections();
    return updatedSection;
  };

  const removeSection = async (sectionId) => {
    await deleteSection(sectionId);
    await fetchSections();
  };

  useEffect(() => {
    const loadSections = async () => {
      await fetchSections();
    };

    loadSections();
  }, [fetchSections]);

  return {
    sections,
    loading,
    error,
    addSection,
    editSection,
    removeSection,
    refreshSections: fetchSections,
  };
}