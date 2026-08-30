import { Op } from "sequelize";

import sequelize from "../config/db.config.js";

import Mission from "../models/missions.model.js";
import MissionsGroupes from "../models/missionsGroupes.model.js";
import MissionsUsers from "../models/missionsUsers.model.js";
import MissionsVehicule from "../models/missionsVehicule.model.js";
import User from "../models/user.model.js";
import Role from "../models/roles.model.js";

import {
  verifierAccesMission,
} from "./validation/missions-Access.service.js";

const normalizeId = (value) =>
  value || null;


const getNomUtilisateur = (
  user,
  fallbackId,
) =>
  [
    user?.grade,
    user?.lastName,
  ]
    .filter(Boolean)
    .join(" ") ||
  `Utilisateur ${fallbackId}`;


/*
 * ==========================================================
 * RÉCUPÉRATION DES CONDUCTEURS D'UNE MISSION
 * ==========================================================
 */

export const getMissionConducteurs = async (
  missionId,
) => {
  const missionsVehicules =
    await MissionsVehicule.findAll({
      where: {
        missionId,
      },

      include: [
        {
          model: User,
          as: "conducteur",
          attributes: {
            exclude: ["password"],
          },

          include: [
            {
              model: Role,
              as: "role",
              attributes: [
                "id",
                "roleName",
              ],
            },
          ],
        },

        {
          model: MissionsGroupes,
          as: "missionGroupe",
        },
      ],
    });

  return missionsVehicules;
};


/*
 * ==========================================================
 * MISE À JOUR DES CONDUCTEURS
 * ==========================================================
 */

export const updateMissionConducteurs = async (
  mission,
  affectationsVehicules = [],
  oaId = null,
  user,
) => {
  if (!mission) {
    const error = new Error(
      "Mission introuvable.",
    );

    error.statusCode = 404;

    throw error;
  }


  await verifierAccesMission(
    mission,
    user,
  );


  if (
    !Array.isArray(
      affectationsVehicules,
    )
  ) {
    const error = new Error(
      "Les affectations de véhicules doivent être un tableau.",
    );

    error.statusCode = 400;

    throw error;
  }


  return sequelize.transaction(
    async (transaction) => {

      /*
       * ======================================================
       * 1. RÉCUPÉRATION DES VÉHICULES
       * ======================================================
       */

      const missionsVehicules =
        await MissionsVehicule.findAll({
          where: {
            missionId:
              mission.id,
          },

          transaction,
        });


      const missionsVehiculesById =
        new Map(
          missionsVehicules.map(
            (missionVehicule) => [
              String(
                missionVehicule.vehiculeId,
              ),

              missionVehicule,
            ],
          ),
        );


      /*
       * ======================================================
       * 2. RÉCUPÉRATION DES UTILISATEURS
       * ======================================================
       */

      const missionsUsers =
        await MissionsUsers.findAll({
          where: {
            missionId:
              mission.id,
          },

          transaction,
        });


      const userIds = [
        ...new Set(
          missionsUsers
            .map(
              (missionUser) =>
                missionUser.userId,
            )
            .filter(Boolean),
        ),
      ];


      const users =
        userIds.length > 0
          ? await User.findAll({
              where: {
                id: {
                  [Op.in]:
                    userIds,
                },
              },

              attributes: {
                exclude: [
                  "password",
                ],
              },

              include: [
                {
                  model: Role,
                  as: "role",
                  attributes: [
                    "id",
                    "roleName",
                  ],
                },
              ],

              transaction,
            })
          : [];


      const usersById =
        new Map(
          users.map(
            (user) => [
              String(user.id),
              user,
            ],
          ),
        );


      const missionUsersByUserId =
        new Map(
          missionsUsers.map(
            (missionUser) => [
              String(
                missionUser.userId,
              ),

              missionUser,
            ],
          ),
        );


      /*
       * ======================================================
       * 3. OA RESPONSABLE
       * ======================================================
       */

      if (oaId) {
        const oa =
          usersById.get(
            String(oaId),
          ) ??
          (await User.findByPk(
            oaId,
            {
              attributes: {
                exclude: [
                  "password",
                ],
              },

              include: [
                {
                  model: Role,
                  as: "role",
                  attributes: [
                    "id",
                    "roleName",
                  ],
                },
              ],

              transaction,
            },
          ));


        if (!oa) {
          const error = new Error(
            "OA responsable introuvable.",
          );

          error.statusCode = 404;

          throw error;
        }


        if (
          oa.role?.roleName !==
          "OA"
        ) {
          const error = new Error(
            "L'utilisateur responsable de la mission doit avoir le rôle OA.",
          );

          error.statusCode = 400;

          throw error;
        }


        await mission.update(
          {
            oaId:
              oa.id,
          },
          {
            transaction,
          },
        );
      }


      /*
       * ======================================================
       * 4. CONDUCTEURS DÉJÀ UTILISÉS
       * ======================================================
       */

      const conducteursDejaAffectes =
        new Set();


      /*
       * ======================================================
       * 5. AFFECTATION
       * ======================================================
       */

      for (
        const affectation
        of affectationsVehicules
      ) {

        const vehiculeId =
          normalizeId(
            affectation?.vehiculeId,
          );


        if (!vehiculeId) {
          continue;
        }


        const missionVehicule =
          missionsVehiculesById.get(
            String(
              vehiculeId,
            ),
          );


        if (!missionVehicule) {
          const error = new Error(
            `Le véhicule ${vehiculeId} n'appartient pas à cette mission.`,
          );

          error.statusCode = 400;

          throw error;
        }


        const conducteurId =
          normalizeId(
            affectation?.conducteurId,
          );


        /*
         * Aucun conducteur :
         * on retire l'ancien.
         */

        if (!conducteurId) {
          await missionVehicule.update(
            {
              conducteurId:
                null,
            },
            {
              transaction,
            },
          );

          continue;
        }


        /*
         * Le conducteur doit
         * appartenir à la mission.
         */

        const missionUser =
          missionUsersByUserId.get(
            String(
              conducteurId,
            ),
          );


        if (!missionUser) {
          const error = new Error(
            `Le conducteur ${conducteurId} n'est pas affecté à cette mission.`,
          );

          error.statusCode = 400;

          throw error;
        }


        const conducteur =
          usersById.get(
            String(
              conducteurId,
            ),
          );


        if (!conducteur) {
          const error = new Error(
            `Le conducteur ${conducteurId} est introuvable.`,
          );

          error.statusCode = 404;

          throw error;
        }


        /*
         * Vérification du rôle.
         */

        const role =
          conducteur.role?.roleName;


        if (
          role !== "conducteur" &&
          role !== "SOA" &&
          role !== "OA"
        ) {
          const error = new Error(
            `${getNomUtilisateur(
              conducteur,
              conducteurId,
            )} ne peut pas être conducteur.`,
          );

          error.statusCode = 400;

          throw error;
        }


        /*
         * Un conducteur ne peut
         * conduire qu'un seul véhicule.
         */

        if (
          conducteursDejaAffectes.has(
            String(
              conducteurId,
            ),
          )
        ) {
          const error = new Error(
            `${getNomUtilisateur(
              conducteur,
              conducteurId,
            )} est déjà affecté à un autre véhicule de cette mission.`,
          );

          error.statusCode = 409;

          throw error;
        }


        conducteursDejaAffectes.add(
          String(
            conducteurId,
          ),
        );


        /*
         * ====================================================
         * GROUPE
         * ====================================================
         */

        const groupeId =
          normalizeId(
            affectation?.groupeId ??
              affectation?.missionGroupeId ??
              missionVehicule
                .missionGroupeId,
          );


        if (groupeId) {
          const missionGroupe =
            await MissionsGroupes.findOne({
              where: {
                id: groupeId,
                missionId:
                  mission.id,
              },

              transaction,
            });


          if (!missionGroupe) {
            const error = new Error(
              "Le groupe sélectionné n'appartient pas à cette mission.",
            );

            error.statusCode = 400;

            throw error;
          }


          if (
            missionUser.missionGroupeId &&
            String(
              missionUser.missionGroupeId,
            ) !==
              String(groupeId)
          ) {
            const error = new Error(
              `${getNomUtilisateur(
                conducteur,
                conducteurId,
              )} n'appartient pas au groupe sélectionné.`,
            );

            error.statusCode = 400;

            throw error;
          }
        }


        /*
         * ====================================================
         * ENREGISTREMENT
         * ====================================================
         */

        await missionVehicule.update(
          {
            conducteurId,
          },
          {
            transaction,
          },
        );
      }


      /*
       * ======================================================
       * RETOUR
       * ======================================================
       */

      return Mission.findByPk(
        mission.id,
        {
          transaction,
        },
      );
    },
  );
};


/*
 * ==========================================================
 * SUPPRESSION DU CONDUCTEUR D'UN VÉHICULE
 * ==========================================================
 */

export const removeMissionConducteur = async (
  missionVehiculeId,
) => {
  const missionVehicule =
    await MissionsVehicule.findByPk(
      missionVehiculeId,
    );


  if (!missionVehicule) {
    const error = new Error(
      "Affectation du véhicule introuvable.",
    );

    error.statusCode = 404;

    throw error;
  }


  await missionVehicule.update({
    conducteurId:
      null,
  });


  return missionVehicule.toJSON();
};