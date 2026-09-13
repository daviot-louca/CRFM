import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Outlet,
  useSearchParams,
  useLocation,
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

  oalId: null,
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

  oalId:
    draft.oalId ??
    draft.informations?.oalId ??
    null,

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

  oalId:
    draft?.oalId ??
    draft?.informations?.oalId ??
    null,

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

  const location = useLocation();

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

  const [oalId, setOalId] =
    useState(
      initialDraft.oalId ??
      initialDraft.informations?.oalId ??
      null,
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
   * UTILISATEURS COMPLETS DE LA MISSION
   *
   * IMPORTANT :
   *
   * usersSelectionnes contient seulement
   * les IDs.
   *
   * usersMission contient les vrais objets
   * User récupérés depuis mission.missionsUsers.
   *
   * C'est cette liste qui permet à l'étape 5
   * d'accéder à :
   *
   * user.role.roleName
   */

  const [
    usersMission,
    setUsersMission,
  ] = useState([]);

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
   */

  useEffect(() => {
    if (!missionIdFromUrl) {
      console.warn(
        "[MISSIONS CONTEXT] ARRÊT : missionIdFromUrl est vide/null",
      );

      return;
    }

    const chargerMission = async () => {
      try {

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

          oalId:
            mission.oalId ??
            mission.oal?.id ??
            null,
        });

        setOalId(
          mission.oalId ??
          mission.oal?.id ??
          null,
        );

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
         * PERSONNEL + SECTIONS
         * ==========================================
         */

        const missionsUsers =
          asArray(
            mission.missionsUsers,
          );

        /*
         * ==========================================
         * NOUVEAU :
         * CONSERVATION DES VRAIS USERS
         * ==========================================
         */

        const usersMissionComplets =
          missionsUsers
            .map(
              (missionUser) =>
                missionUser?.user ??
                null,
            )
            .filter(Boolean);

        setUsersMission(
          usersMissionComplets,
        );


        const usersParSection =
          {};

        const sectionsParCompagnie =
          {};

        missionsUsers.forEach(
          (missionUser) => {
            /*
             * IMPORTANT :
             *
             * missionsUsers contient :
             *
             * {
             *   id: ID de missions_users,
             *   userId: ID du vrai User
             * }
             *
             * On utilise toujours userId.
             */

            const userId =
              missionUser?.userId ??
              missionUser?.user?.id ??
              null;

            const sectionId =
              missionUser?.sectionId ??
              missionUser?.section?.id ??
              missionUser?.user
                ?.sectionId ??
              missionUser?.user
                ?.section?.id ??
              null;

            const compagnieId =
              missionUser?.compagnieId ??
              missionUser?.compagnie?.id ??
              missionUser?.section
                ?.compagnieId ??
              missionUser?.section
                ?.compagnie?.id ??
              missionUser?.user
                ?.compagnieId ??
              missionUser?.user
                ?.compagnie?.id ??
              null;

            if (
              userId &&
              sectionId
            ) {
              if (
                !usersParSection[
                  sectionId
                ]
              ) {
                usersParSection[
                  sectionId
                ] =
                  new Set();
              }

              usersParSection[
                sectionId
              ].add(
                userId,
              );
            }

            if (
              sectionId &&
              compagnieId
            ) {
              if (
                !sectionsParCompagnie[
                  compagnieId
                ]
              ) {
                sectionsParCompagnie[
                  compagnieId
                ] = [];
              }

              if (
                !sectionsParCompagnie[
                  compagnieId
                ].includes(
                  sectionId,
                )
              ) {
                sectionsParCompagnie[
                  compagnieId
                ].push(
                  sectionId,
                );
              }
            }
          },
        );

        setUsersSelectionnes(
          usersParSection,
        );

        setSectionsSelectionnees(
          sectionsParCompagnie,
        );

        /*
         * ==========================================
         * ÉTAPE 3 + 4
         * ==========================================
         */

        const vehiculesApi =
          asArray(
            mission.vehicules,
          );

        const missionsVehiculesApi =
          asArray(
            mission.missionsVehicules,
          );

        /*
         * Index des relations missions_vehicules
         * par ID du véhicule.
         */

        const missionsVehiculesByVehiculeId =
          new Map(
            missionsVehiculesApi.map(
              (
                missionVehicule,
              ) => [
                missionVehicule?.vehiculeId ??
                missionVehicule
                  ?.vehicule
                  ?.id ??
                missionVehicule?.id,

                missionVehicule,
              ],
            ),
          );


        /*
         * Reconstruction des véhicules.
         */

        const vehicules =
          vehiculesApi.map(
            (vehicule) => {
              const vehiculeId =
                vehicule?.vehiculeId ??
                vehicule?.id ??
                null;

              const missionVehicule =
                missionsVehiculesByVehiculeId.get(
                  vehiculeId,
                );

              const groupeIdApi =
                missionVehicule
                  ?.missionGroupeId ??
                missionVehicule
                  ?.groupeId ??
                vehicule
                  ?.missionGroupeId ??
                vehicule
                  ?.groupeId ??
                null;

              const groupeCorrespondant =
                groupes.find(
                  (groupe) =>
                    String(
                      groupe?.id ??
                      "",
                    ) ===
                    String(
                      groupeIdApi ??
                      "",
                    ),
                ) ??
                groupes.find(
                  (groupe) =>
                    String(
                      groupe?.nom ??
                      "",
                    )
                      .trim()
                      .toLowerCase() ===
                    String(
                      vehicule?.groupe ??
                      "",
                    )
                      .trim()
                      .toLowerCase(),
                );

              const vehiculeNormalise =
                {
                  vehiculeId,

                  compagnieId:
                    missionVehicule
                      ?.compagnieId ??
                    vehicule
                      ?.compagnieId ??
                    vehicule
                      ?.compagnie
                      ?.id ??
                    null,

                  groupeId:
                    groupeIdApi ??
                    groupeCorrespondant
                      ?.id ??
                    null,

                  groupeNom:
                    typeof vehicule
                      ?.groupe ===
                      "string"
                      ? vehicule.groupe
                      : vehicule
                        ?.groupe
                        ?.nom ??
                      groupeCorrespondant
                        ?.nom ??
                      null,

                  sectionId:
                    missionVehicule
                      ?.sectionId ??
                    vehicule
                      ?.sectionId ??
                    vehicule
                      ?.section
                      ?.id ??
                    null,

                  conducteurId:
                    missionVehicule
                      ?.conducteurId ??
                    vehicule
                      ?.conducteurId ??
                    vehicule
                      ?.conducteur
                      ?.id ??
                    null,

                  vehicule,
                };

              return vehiculeNormalise;
            },
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
    location.pathname,
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

      oalId,

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

    oalId,

    vehiculesSelectionnes,
  ]);

  /*
   * ==========================================
   * RESET
   * ==========================================
   */

  const resetMissionDraft =
    useCallback(
      () => {
        const emptyDraft =
          createEmptyDraft();

        setMissionId(
          emptyDraft.missionId,
        );

        setInformations(
          emptyDraft.informations,
        );

        setOalId(
          emptyDraft.oalId,
        );

        setCompagniesSelectionneesIds(
          emptyDraft
            .compagniesSelectionneesIds,
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

        setUsersMission([]);

        setGroupesManuels(
          emptyDraft.groupesManuels,
        );

        setVehiculesSelectionnes(
          emptyDraft
            .vehiculesSelectionnes,
        );

        clearMissionCreationDraftStorage();
      },
      [],
    );

  /*
   * ==========================================
   * CONTEXT
   * ==========================================
   */

  const value =
    useMemo(
      () => ({
        /*
         * Mission
         */

        missionId,

        oalId,

        setOalId,

        setMissionId,

        /*
         * Informations
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

        usersMission,

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

        oalId,

        compagniesSelectionneesIds,

        sectionsSelectionnees,

        sectionsIgnorees,

        usersSelectionnes,

        usersMission,

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