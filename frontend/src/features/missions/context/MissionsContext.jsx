import { useCallback, useEffect, useMemo, useState } from "react";
import { Outlet } from "react-router-dom";
import { MissionsContext } from "./MissionsContextValue";
import {
  MISSION_CREATION_DRAFT_STORAGE_KEY,
  clearMissionCreationDraftStorage,
} from "../utils/missionDraftStorage";

const createEmptyDraft = () => ({
  missionId: null,

  informations: {},

  compagniesSelectionneesIds: [],

  sectionsSelectionnees: {},

  usersSelectionnes: {},

  groupesManuels: [],

  vehiculesSelectionnes: [],

  sectionsIgnorees: [],
});

const asArray = (value) => {
  if (Array.isArray(value)) return value;

  if (value instanceof Set) {
    return [...value];
  }

  return [];
};

const serializeSelectionMap = (
  selectionMap = {},
) =>
  Object.fromEntries(
    Object.entries(selectionMap).map(
      ([key, value]) => [
        key,
        asArray(value),
      ],
    ),
  );

const deserializeSelectionMap = (
  selectionMap = {},
) =>
  Object.fromEntries(
    Object.entries(selectionMap).map(
      ([key, value]) => [
        key,
        new Set(asArray(value)),
      ],
    ),
  );

const deserializeSectionsSelectionnees = (
  selectionMap = {},
) =>
  Object.fromEntries(
    Object.entries(selectionMap).map(
      ([key, value]) => [
        key,
        asArray(value),
      ],
    ),
  );

const normalizeGroupes = (
  groupes = [],
) =>
  asArray(groupes).map(
    (groupe, index) => ({
      ...groupe,

      id:
        groupe.id ??
        crypto.randomUUID(),

      nom:
        groupe.nom ??
        `Groupe ${index + 1}`,

      ordre:
        groupe.ordre ??
        index + 1,

      soaId:
        groupe.soaId ??
        null,

      users: asArray(
        groupe.users ??
          groupe.userIds,
      ),
    }),
  );

const serializeDraft = (draft) => ({
  missionId:
    draft.missionId ?? null,

  informations:
    draft.informations ?? {},

  compagniesSelectionneesIds:
    asArray(
      draft.compagniesSelectionneesIds,
    ),

  sectionsSelectionnees:
    serializeSelectionMap(
      draft.sectionsSelectionnees,
    ),

  usersSelectionnes:
    serializeSelectionMap(
      draft.usersSelectionnes,
    ),

  groupesManuels:
    normalizeGroupes(
      draft.groupesManuels,
    ),

  vehiculesSelectionnes:
    asArray(
      draft.vehiculesSelectionnes,
    ),

  sectionsIgnorees:
    asArray(
      draft.sectionsIgnorees,
    ),
});

const deserializeDraft = (
  draft,
) => ({
  missionId:
    draft?.missionId ?? null,

  informations:
    draft?.informations ?? {},

  compagniesSelectionneesIds:
    asArray(
      draft?.compagniesSelectionneesIds,
    ),

  sectionsSelectionnees:
    deserializeSectionsSelectionnees(
      draft?.sectionsSelectionnees,
    ),

  usersSelectionnes:
    deserializeSelectionMap(
      draft?.usersSelectionnes,
    ),

  groupesManuels:
    normalizeGroupes(
      draft?.groupesManuels,
    ),

  vehiculesSelectionnes:
    asArray(
      draft?.vehiculesSelectionnes,
    ),

  sectionsIgnorees:
    asArray(
      draft?.sectionsIgnorees,
    ),
});

const readStoredDraft = () => {
  if (
    typeof window === "undefined"
  ) {
    return createEmptyDraft();
  }

  try {
    const rawDraft =
      window.localStorage.getItem(
        MISSION_CREATION_DRAFT_STORAGE_KEY,
      );

    return rawDraft
      ? deserializeDraft(
          JSON.parse(rawDraft),
        )
      : createEmptyDraft();
  } catch (error) {
    console.warn(
      "Impossible de restaurer le brouillon mission.",
      error,
    );

    return createEmptyDraft();
  }
};

const writeStoredDraft = (
  draft,
) => {
  if (
    typeof window === "undefined"
  ) {
    return;
  }

  try {
    window.localStorage.setItem(
      MISSION_CREATION_DRAFT_STORAGE_KEY,
      JSON.stringify(
        serializeDraft(draft),
      ),
    );
  } catch (error) {
    console.warn(
      "Impossible de sauvegarder le brouillon mission.",
      error,
    );
  }
};

export function MissionsProvider({
  children,
}) {
  const [initialDraft] =
    useState(
      readStoredDraft,
    );

  /*
   * ==========================================
   * ID DE LA MISSION
   * ==========================================
   *
   * L'étape 1 crée la mission et récupère
   * son ID.
   *
   * Les étapes 2, 3 et 4 utilisent ensuite
   * ce même ID pour compléter la mission.
   */

  const [missionId, setMissionId] =
    useState(
      initialDraft.missionId,
    );

  const [informations, setInformations] =
    useState(
      initialDraft.informations,
    );

  const [
    compagniesSelectionneesIds,
    setCompagniesSelectionneesIds,
  ] = useState(
    initialDraft.compagniesSelectionneesIds,
  );

  const [
    sectionsSelectionnees,
    setSectionsSelectionnees,
  ] = useState(
    initialDraft.sectionsSelectionnees,
  );

  const [
    sectionsIgnorees,
    setSectionsIgnorees,
  ] = useState(
    initialDraft.sectionsIgnorees,
  );

  const [
    usersSelectionnes,
    setUsersSelectionnes,
  ] = useState(
    initialDraft.usersSelectionnes,
  );

  const [
    groupesManuels,
    setGroupesManuels,
  ] = useState(
    initialDraft.groupesManuels,
  );

  const [
    vehiculesSelectionnes,
    setVehiculesSelectionnes,
  ] = useState(
    initialDraft.vehiculesSelectionnes,
  );

  /*
   * ==========================================
   * SAUVEGARDE DU BROUILLON
   * ==========================================
   */

  useEffect(() => {
    writeStoredDraft({
      missionId,

      informations,

      compagniesSelectionneesIds,

      sectionsSelectionnees,

      sectionsIgnorees,

      usersSelectionnes,

      groupesManuels,

      vehiculesSelectionnes,
    });
  }, [
    missionId,

    informations,

    compagniesSelectionneesIds,

    sectionsSelectionnees,

    sectionsIgnorees,

    usersSelectionnes,

    groupesManuels,

    vehiculesSelectionnes,
  ]);

  /*
   * ==========================================
   * RESET
   * ==========================================
   */

  const resetMissionDraft =
    useCallback(() => {
      const emptyDraft =
        createEmptyDraft();

      setMissionId(
        emptyDraft.missionId,
      );

      setInformations(
        emptyDraft.informations,
      );

      setCompagniesSelectionneesIds(
        emptyDraft.compagniesSelectionneesIds,
      );

      setSectionsSelectionnees(
        emptyDraft.sectionsSelectionnees,
      );

      setSectionsIgnorees(
        emptyDraft.sectionsIgnorees,
      );

      setUsersSelectionnes(
        emptyDraft.usersSelectionnes,
      );

      setGroupesManuels(
        emptyDraft.groupesManuels,
      );

      setVehiculesSelectionnes(
        emptyDraft.vehiculesSelectionnes,
      );

      clearMissionCreationDraftStorage();
    }, []);

  /*
   * ==========================================
   * CONTEXT
   * ==========================================
   */

  const value = useMemo(
    () => ({
      /*
       * Mission
       */

      missionId,

      setMissionId,

      /*
       * Informations étape 1
       */

      informations,

      setInformations,

      /*
       * Compagnies
       */

      compagniesSelectionneesIds,

      setCompagniesSelectionneesIds,

      /*
       * Sections
       */

      sectionsSelectionnees,

      setSectionsSelectionnees,

      sectionsIgnorees,

      setSectionsIgnorees,

      /*
       * Personnel
       */

      usersSelectionnes,

      setUsersSelectionnes,

      /*
       * Groupes
       */

      groupesManuels,

      setGroupesManuels,

      /*
       * Véhicules
       */

      vehiculesSelectionnes,

      setVehiculesSelectionnes,

      /*
       * Reset
       */

      resetMissionDraft,
    }),
    [
      missionId,

      informations,

      compagniesSelectionneesIds,

      sectionsSelectionnees,

      sectionsIgnorees,

      usersSelectionnes,

      groupesManuels,

      vehiculesSelectionnes,

      resetMissionDraft,
    ],
  );

  return (
    <MissionsContext.Provider
      value={value}
    >
      {children ?? <Outlet />}
    </MissionsContext.Provider>
  );
}