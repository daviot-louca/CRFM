export const MISSION_CREATION_DRAFT_STORAGE_KEY =
  "crfm.missions.creationDraft.v1";

export const clearMissionCreationDraftStorage = () => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(MISSION_CREATION_DRAFT_STORAGE_KEY);
  } catch (error) {
    console.warn("Impossible de supprimer le brouillon mission.", error);
  }
};
