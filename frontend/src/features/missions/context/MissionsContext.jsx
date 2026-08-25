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
  console.log(
    "[MISSIONS CONTEXT] PROVIDER MONTÉ",
  );

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
        console.log(
          "[MISSIONS CONTEXT] Chargement de la mission :",
          missionIdFromUrl,
        );

        const mission =
          await getMissionById(
            missionIdFromUrl,
          );

        console.log(
          "========== [MISSIONS CONTEXT] MISSION API ==========",
        );

        console.log(
          "[MISSIONS CONTEXT] mission complète :",
          mission,
        );

        console.log(
          "[MISSIONS CONTEXT] mission JSON :",
          JSON.parse(
            JSON.stringify(
              mission,
            ),
          ),
        );

        console.log(
          "[MISSIONS CONTEXT] mission.vehicules :",
          mission?.vehicules,
        );

        console.log(
          "[MISSIONS CONTEXT] mission.vehicules JSON :",
          JSON.parse(
            JSON.stringify(
              mission?.vehicules ?? [],
            ),
          ),
        );

        console.log(
          "[MISSIONS CONTEXT] mission.missionsVehicules :",
          mission?.missionsVehicules,
        );

        console.log(
          "[MISSIONS CONTEXT] mission.missionsVehicules JSON :",
          JSON.parse(
            JSON.stringify(
              mission?.missionsVehicules ?? [],
            ),
          ),
        );

        console.log(
          "====================================================",
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
         * PERSONNEL + SECTIONS
         * ==========================================
         */

        const missionsUsers =
          asArray(
            mission.missionsUsers,
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

        console.log(
          "[MISSIONS CONTEXT] Personnel restauré :",
          Object.fromEntries(
            Object.entries(
              usersParSection,
            ).map(
              ([
                sectionId,
                userIds,
              ]) => [
                sectionId,
                [...userIds],
              ],
            ),
          ),
        );

        console.log(
          "[MISSIONS CONTEXT] Sections restaurées :",
          sectionsParCompagnie,
        );

        /*
         * ==========================================
         * ÉTAPE 3 + 4
         * ==========================================
         *
         * IMPORTANT :
         *
         * mission.vehicules contient les véhicules.
         *
         * mission.missionsVehicules contient les relations
         * entre la mission et les véhicules.
         *
         * C'est cette seconde source qui contient notamment
         * le véritable missionGroupeId.
         */

        const vehiculesApi =
          asArray(
            mission.vehicules,
          );

        const missionsVehiculesApi =
          asArray(
            mission.missionsVehicules,
          );

        console.log(
          "[MISSIONS CONTEXT] Véhicules API :",
          vehiculesApi,
        );

        console.log(
          "[MISSIONS CONTEXT] MissionsVehicules API :",
          missionsVehiculesApi,
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

        console.log(
          "[MISSIONS CONTEXT] Index missionsVehicules :",
          missionsVehiculesByVehiculeId,
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

              /*
               * Récupération du vrai groupe.
               */

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

              /*
               * Recherche du groupe correspondant.
               */

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

              /*
               * Construction de l'objet utilisé
               * par les étapes 3 et 4.
               */

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

              console.log(
                "[MISSIONS CONTEXT] Véhicule restauré :",
                {
                  vehiculeId,

                  missionVehicule,

                  groupeIdApi,

                  groupeCorrespondant,

                  vehiculeNormalise,
                },
              );

              return vehiculeNormalise;
            },
          );

        /*
         * IMPORTANT :
         *
         * On conserve les véhicules dans le contexte
         * même si certaines informations de relation
         * sont nulles.
         */

        setVehiculesSelectionnes(
          vehicules,
        );

        console.log(
          "[MISSIONS CONTEXT] Véhicules restaurés dans le contexte :",
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
         * FIN CHARGEMENT
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
    location.pathname
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