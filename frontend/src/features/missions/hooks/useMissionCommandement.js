import { useEffect, useMemo, useState } from "react";

import {
  getMissionById,
  getMissionUsersByGroup,
  updateMissionCommandement,
} from "../api/missions.api";

/* ============================================================
   OUTILS
============================================================ */

const getId = (value) => {
  if (!value) return null;

  if (typeof value === "object") {
    return (
      value.id ??
      value.userId ??
      value.personnelId ??
      value.utilisateurId ??
      null
    );
  }

  return value;
};

const getNom = (user) => {
  if (!user) {
    return "Utilisateur";
  }

  const firstName =
    user.firstName ??
    user.firstname ??
    user.prenom ??
    "";

  const lastName =
    user.lastName ??
    user.lastname ??
    user.nom ??
    "";

  const grade =
    user.grade ??
    user.gradeName ??
    "";

  const nom = [
    grade,
    firstName,
    lastName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    nom ||
    user.name ||
    user.fullName ||
    user.displayName ||
    `Utilisateur ${getId(user) ?? ""}`
  );
};

/* ============================================================
   DÉTECTION DU RÔLE SOA
============================================================ */

const normaliseRole = (role) => {
  if (!role) {
    return "";
  }

  if (typeof role === "string") {
    return role.trim().toUpperCase();
  }

  return (
    role.roleName ??
    role.name ??
    role.nom ??
    role.label ??
    role.libelle ??
    role.nomRole ??
    ""
  )
    .toString()
    .trim()
    .toUpperCase();
};

const isSoa = (user) => {
  if (!user) {
    return false;
  }

  /*
   * Structure attendue :
   *
   * user.role.roleName
   */
  if (
    normaliseRole(user.role) ===
    "SOA"
  ) {
    return true;
  }

  /*
   * Sécurité si l'API renvoie plusieurs rôles.
   */
  if (
    Array.isArray(user.roles) &&
    user.roles.some(
      (role) =>
        normaliseRole(role) ===
        "SOA",
    )
  ) {
    return true;
  }

  /*
   * Autres structures éventuelles.
   */
  if (
    normaliseRole(user.Role) ===
    "SOA"
  ) {
    return true;
  }

  if (
    normaliseRole(user.fonction) ===
    "SOA"
  ) {
    return true;
  }

  if (
    normaliseRole(user.poste) ===
    "SOA"
  ) {
    return true;
  }

  return false;
};

/* ============================================================
   EXTRACTION DES UTILISATEURS
============================================================ */

const extractArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  const possibles = [
    value.users,
    value.usersMission,
    value.missionUsers,
    value.missionsUsers,
    value.personnels,
    value.personnel,
    value.utilisateurs,
    value.data,
    value.result,
    value.results,
    value.rows,
  ];

  for (const possible of possibles) {
    if (Array.isArray(possible)) {
      return possible;
    }
  }

  for (const possible of possibles) {
    if (
      possible &&
      typeof possible === "object"
    ) {
      const nested =
        extractArray(possible);

      if (nested.length > 0) {
        return nested;
      }
    }
  }

  return [];
};

/* ============================================================
   EXTRACTION DE L'UTILISATEUR
============================================================ */

const extractUser = (missionUser) => {
  if (!missionUser) {
    return null;
  }

  /*
   * Structure principale attendue :
   *
   * {
   *   user: {
   *     id: ...,
   *     role: {
   *       roleName: "SOA"
   *     }
   *   }
   * }
   */

  if (missionUser.user) {
    return missionUser.user;
  }

  if (missionUser.personnel) {
    return missionUser.personnel;
  }

  if (missionUser.utilisateur) {
    return missionUser.utilisateur;
  }

  if (missionUser.User) {
    return missionUser.User;
  }

  if (missionUser.Personnel) {
    return missionUser.Personnel;
  }

  /*
   * Si l'objet reçu est déjà l'utilisateur.
   */

  return missionUser;
};

/* ============================================================
   HOOK
============================================================ */

export default function useMissionCommandement(
  missionId,
  compagnies = [],
) {
  const [oalId, setOalId] =
    useState(null);

  const [
    groupesCommandement,
    setGroupesCommandement,
  ] = useState([]);

  const [soaMission, setSoaMission] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState(null);


  const oalDisponibles = useMemo(() => {
    const map = new Map();

    compagnies.forEach(
      (compagnie) => {
        const oal =
          compagnie?.oal ??
          compagnie?.OAL ??
          compagnie?.officierAction ??
          compagnie?.officierActionResponsable ??
          null;

        if (!oal) {
          return;
        }

        const id = getId(oal);

        if (!id) {
          return;
        }

        map.set(
          String(id),
          oal,
        );
      },
    );

    return Array.from(
      map.values(),
    );
  }, [compagnies]);

  /* ==========================================================
     CHARGEMENT DE LA MISSION
  ========================================================== */

  useEffect(() => {
    if (!missionId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSoaMission([]);
      setGroupesCommandement([]);
      setOalId(null);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        /* ------------------------------------------------------
           MISSION
        ------------------------------------------------------ */

        const missionResponse =
          await getMissionById(
            missionId,
          );

        if (cancelled) {
          return;
        }

        const mission =
          missionResponse?.data ??
          missionResponse?.mission ??
          missionResponse;

        /* ------------------------------------------------------
           OA ACTUEL
        ------------------------------------------------------ */

        setOalId(
          mission?.oalId
            ? String(
                mission.oalId,
              )
            : null,
        );

        /* ------------------------------------------------------
           GROUPES
        ------------------------------------------------------ */

        const missionsGroupes =
          Array.isArray(
            mission?.missionsGroupes,
          )
            ? mission.missionsGroupes
            : Array.isArray(
                mission?.groupes,
              )
              ? mission.groupes
              : [];

        const groupesEtat =
          missionsGroupes.map(
            (groupe) => ({
              groupeId:
                groupe?.id,

              soaId:
                groupe?.soaId
                  ? String(
                      groupe.soaId,
                    )
                  : null,
            }),
          );

        setGroupesCommandement(
          groupesEtat,
        );

        /* ------------------------------------------------------
           RÉCUPÉRATION DES PERSONNELS
        ------------------------------------------------------ */

        const groupesIds =
          missionsGroupes
            .map(
              (groupe) =>
                groupe?.id,
            )
            .filter(Boolean);

        if (
          groupesIds.length === 0
        ) {
          setSoaMission([]);
          return;
        }

        /*
         * Chaque groupe possède des missions-users.
         *
         * On récupère les personnels de chaque groupe.
         */

        const responses =
          await Promise.all(
            groupesIds.map(
              async (groupeId) => {
                try {
                  return await getMissionUsersByGroup(
                    groupeId,
                  );
                } catch (err) {
                  console.error(
                    `Erreur récupération personnels du groupe ${groupeId}`,
                    err,
                  );

                  return null;
                }
              },
            ),
          );

        if (cancelled) {
          return;
        }

        /* ------------------------------------------------------
           FILTRAGE DES SOA
        ------------------------------------------------------ */

        const soaMap = new Map();

        responses.forEach(
          (response) => {
            if (!response) {
              return;
            }

            const missionUsers =
              extractArray(
                response,
              );

            missionUsers.forEach(
              (missionUser) => {
                const user =
                  extractUser(
                    missionUser,
                  );

                if (!user) {
                  return;
                }

                const id =
                  getId(user);

                if (!id) {
                  return;
                }

                /*
                 * Le rôle est maintenant attendu
                 * ici :
                 *
                 * user.role.roleName
                 */

                if (
                  !isSoa(user)
                ) {
                  return;
                }

                /*
                 * Déduplication :
                 * un SOA présent dans plusieurs groupes
                 * n'apparaît qu'une seule fois.
                 */

                soaMap.set(
                  String(id),
                  user,
                );
              },
            );
          },
        );

        const soaFinal =
          Array.from(
            soaMap.values(),
          );


        setSoaMission(
          soaFinal,
        );
      } catch (err) {
        console.error(
          "[MISSION COMMANDEMENT] erreur :",
          err,
        );

        if (!cancelled) {
          setError(
            err?.response?.data
              ?.message ??
              err?.message ??
              "Impossible de charger le commandement de la mission.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [missionId]);

  /* ==========================================================
     SÉLECTION OA
  ========================================================== */

  const selectOal = (value) => {
    setOalId(
      value
        ? String(value)
        : null,
    );
  };

  /* ==========================================================
     SÉLECTION SOA
     
     1 SOA par groupe.
  ========================================================== */

  const selectSoa = (
    groupeId,
    value,
  ) => {
    setGroupesCommandement(
      (current) =>
        current.map(
          (groupe) =>
            String(
              groupe.groupeId,
            ) ===
            String(groupeId)
              ? {
                  ...groupe,

                  soaId:
                    value
                      ? String(
                          value,
                        )
                      : null,
                }
              : groupe,
        ),
    );
  };

  /* ==========================================================
     SAUVEGARDE
  ========================================================== */

  const saveCommandement =
    async () => {
      if (!missionId) {
        throw new Error(
          "Aucune mission sélectionnée.",
        );
      }

      if (!oalId) {
        throw new Error(
          "Veuillez sélectionner l'OAL responsable de la mission.",
        );
      }

      setSaving(true);
      setError(null);

      try {
        return await updateMissionCommandement(
          missionId,
          oalId,
          groupesCommandement,
        );
      } catch (err) {
        const message =
          err?.response?.data
            ?.message ??
          err?.message ??
          "Impossible de sauvegarder le commandement.";

        setError(message);

        throw err;
      } finally {
        setSaving(false);
      }
    };

  /* ==========================================================
     RETOUR
  ========================================================== */

  return {
    oalId,

    oalDisponibles,

    soaMission,

    groupesCommandement,

    loading,
    saving,
    error,

    selectOal,
    selectSoa,

    saveCommandement,

    getUserId: getId,
    getUserName: getNom,
    isSoa,
  };
}