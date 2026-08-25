import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Outlet,
  useSearchParams,
} from "react-router-dom";

import { MissionsContext } from "./MissionsContextValue";

import {
  MISSION_CREATION_DRAFT_STORAGE_KEY,
  clearMissionCreationDraftStorage,
} from "../utils/missionDraftStorage";

import { getMissionById } from "../api/missions.api";

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
  if (Array.isArray(value)) {
    return value;
  }

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
  const [searchParams] =
    useSearchParams();

  const missionIdFromUrl =
    searchParams.get("missionId");

  const [initialDraft] =
    useState(
      readStoredDraft,
    );

  /*
   * ==========================================
   * ID DE LA MISSION
   * ==========================================
   */

  const [missionId, setMissionId] =
    useState(
      initialDraft.missionId,
    );

  /*
   * ==========================================
   * INFORMATIONS ÉTAPE 1
   * ==========================================
   */

  const [informations, setInformations] =
    useState(
      initialDraft.informations,
    );

  /*
   * ==========================================
   * COMPAGNIES
   * ==========================================
   */

  const [
    compagniesSelectionneesIds,
    setCompagniesSelectionneesIds,
  ] = useState(
    initialDraft.compagniesSelectionneesIds,
  );

  /*
   * ==========================================
   * SECTIONS
   * ==========================================
   */

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

  /*
   * ==========================================
   * PERSONNEL
   * ==========================================
   */

  const [
    usersSelectionnes,
    setUsersSelectionnes,
  ] = useState(
    initialDraft.usersSelectionnes,
  );

  /*
   * ==========================================
   * GROUPES
   * ==========================================
   */

  const [
    groupesManuels,
    setGroupesManuels,
  ] = useState(
    initialDraft.groupesManuels,
  );

  /*
   * ==========================================
   * VÉHICULES
   * ==========================================
   */

  const [
    vehiculesSelectionnes,
    setVehiculesSelectionnes,
  ] = useState(
    initialDraft.vehiculesSelectionnes,
  );

  /*
   * ==========================================
   * CHARGEMENT D'UNE MISSION EXISTANTE
   * ==========================================
   *
   * Lorsqu'on arrive depuis MissionDetail avec :
   *
   * ?missionId=XXXXXXXX
   *
   * on récupère la mission depuis la BDD
   * et on recharge le contexte.
   */

  useEffect(() => {
    if (!missionIdFromUrl) {
      return;
    }

    const chargerMission = async () => {
      try {
        console.log(
          "[MISSIONS CONTEXT] Chargement de la mission :",
          missionIdFromUrl,
        );

        const mission =
          await getMissionById(
            missionIdFromUrl,
          );

        if (!mission) {
          console.warn(
            "[MISSIONS CONTEXT] Mission introuvable :",
            missionIdFromUrl,
          );

          return;
        }

        /*
         * ==========================================
         * ID
         * ==========================================
         */

        setMissionId(
          mission.id,
        );

        /*
         * ==========================================
         * ÉTAPE 1
         * ==========================================
         */

        setInformations({
          missionName:
            mission.missionName ??
            "",

          missionDescription:
            mission.missionDescription ??
            "",

          debutMission:
            mission.debutMission ??
            "",

          finMission:
            mission.finMission ??
            "",

          typeMission:
            mission.typeMission ??
            "",

          lieuMission:
            mission.lieuMission ??
            "",

          StatutMission:
            mission.StatutMission ??
            "En préparation",

          oaId:
            mission.oaId ??
            mission.oa?.id ??
            null,
        });

        /*
         * ==========================================
         * ÉTAPE 2
         * ==========================================
         */

        const groupes =
          normalizeGroupes(
            mission.groupes ??
              [],
          );

        setGroupesManuels(
          groupes,
        );

        /*
         * ==========================================
         * ÉTAPE 3 + 4
         * ==========================================
         *
         * On récupère les véhicules déjà
         * affectés à la mission.
         */

        const vehicules =
          asArray(
            mission.vehicules,
          ).map(
            (vehicule) => ({
              vehiculeId:
                vehicule.vehiculeId ??
                vehicule.id ??
                null,

              compagnieId:
                vehicule.compagnieId ??
                vehicule.compagnie?.id ??
                null,

              groupeId:
                vehicule.groupeId ??
                vehicule.missionGroupeId ??
                vehicule.groupe?.id ??
                null,

              sectionId:
                vehicule.sectionId ??
                vehicule.section?.id ??
                null,

              conducteurId:
                vehicule.conducteurId ??
                vehicule.conducteur?.id ??
                null,
            }),
          );

        setVehiculesSelectionnes(
          vehicules,
        );

        /*
         * ==========================================
         * COMPAGNIES
         * ==========================================
         */

        const compagniesIds =
          asArray(
            mission.compagnies,
          )
            .map(
              (compagnie) =>
                compagnie?.id ??
                compagnie?.compagnieId ??
                compagnie,
            )
            .filter(Boolean);

        setCompagniesSelectionneesIds(
          compagniesIds,
        );

        /*
         * ==========================================
         * LOG
         * ==========================================
         */

        console.log(
          "[MISSIONS CONTEXT] Mission chargée avec succès :",
          mission.id,
        );

        console.log(
          "[MISSIONS CONTEXT] Groupes :",
          groupes,
        );

        console.log(
          "[MISSIONS CONTEXT] Véhicules :",
          vehicules,
        );
      } catch (error) {
        console.error(
          "[MISSIONS CONTEXT] Impossible de charger la mission :",
          error,
        );
      }
    };

    chargerMission();
  }, [
    missionIdFromUrl,
  ]);

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