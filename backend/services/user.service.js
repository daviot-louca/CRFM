import User from '../models/user.model.js';
import { hash } from 'bcrypt';
import { randomInt } from 'node:crypto';
import Role from '../models/roles.model.js';
import Section from '../models/sections.model.js';
import Compagnie from '../models/compagnie.model.js';
import MissionsUsers from '../models/missionsUsers.model.js';
import Mission from '../models/missions.model.js';
import { Op } from 'sequelize';

const userAttributes = { exclude: ['password'] };

const userContextIncludes = [
  {
    model: Role,
    as: 'role',
    attributes: ['id', 'roleName'],
  },
  {
    model: Section,
    as: 'section',
    attributes: ['id', 'sectionName', 'compagnieId'],
    include: [
      {
        model: Compagnie,
        as: 'compagnie',
        attributes: ['id', 'nom', 'oaId'],
      },
    ],
  },
];

const formatUserResponse = (user) => {
  const userData =
    typeof user.toJSON === 'function'
      ? user.toJSON()
      : user;

  delete userData.password;

  return {
    ...userData,
    roleName: userData.role?.roleName ?? null,
    sectionName:
      userData.section?.sectionName ?? null,
    compagnieId:
      userData.section?.compagnieId ??
      userData.section?.compagnie?.id ??
      null,
    compagnieName:
      userData.section?.compagnie?.nom ??
      null,
  };
};

export const allUsersService = async () => {
  const users = await User.findAll({
    attributes: userAttributes,
    include: userContextIncludes,
  });

  return users.map(formatUserResponse);
};

export const allUsersBySectionService = async (
  sectionId,
) => {
  const users = await User.findAll({
    where: { sectionId },
    attributes: userAttributes,
    include: userContextIncludes,
  });

  return users.map(formatUserResponse);
};

export const allUsersBySectionWithAvailabilityService =
  async (
    sectionId,
    debutMission,
    finMission,
  ) => {
    const users = await User.findAll({
      where: { sectionId },
      attributes: userAttributes,
      include: userContextIncludes,
    });

    if (users.length === 0) {
      return [];
    }

    const userIds = users.map(
      (user) => user.id,
    );

    const conflits = await MissionsUsers.findAll({
      where: {
        userId: {
          [Op.in]: userIds,
        },
      },
      include: [
        {
          model: Mission,
          as: 'mission',
          required: true,
          where: {
            debutMission: {
              [Op.lte]: finMission,
            },
            finMission: {
              [Op.gte]: debutMission,
            },
          },
          attributes: [
            'id',
            'missionName',
            'debutMission',
            'finMission',
          ],
        },
      ],
    });

    const conflitsParUtilisateur =
      new Map();

    conflits.forEach((affectation) => {
      const conflit = affectation.mission;

      if (!conflit) return;

      if (
        !conflitsParUtilisateur.has(
          affectation.userId,
        )
      ) {
        conflitsParUtilisateur.set(
          affectation.userId,
          [],
        );
      }

      conflitsParUtilisateur
        .get(affectation.userId)
        .push({
          missionId: conflit.id,
          missionName:
            conflit.missionName,
          debutMission:
            conflit.debutMission,
          finMission:
            conflit.finMission,
        });
    });

    return users.map((user) => {
      const userData =
        formatUserResponse(user);

      const missionsEnConflit =
        conflitsParUtilisateur.get(
          user.id,
        ) || [];

      return {
        ...userData,
        disponible:
          missionsEnConflit.length === 0,
        conflit:
          missionsEnConflit[0] || null,
        conflits: missionsEnConflit,
      };
    });
  };

export const allUsersByCompagnieService =
  async (compagnieId) => {
    const sections =
      await Section.findAll({
        where: { compagnieId },
        attributes: ['id'],
      });

    const sectionIds = sections.map(
      (section) => section.id,
    );

    if (sectionIds.length === 0) {
      return [];
    }

    const oaRole = await Role.findOne({
      where: { roleName: 'OA' },
      attributes: ['id'],
    });

    if (!oaRole) {
      return [];
    }

    const users = await User.findAll({
      where: {
        sectionId: sectionIds,
        roleId: oaRole.id,
      },
      attributes: userAttributes,
      include: userContextIncludes,
    });

    return users.map(formatUserResponse);
  };

export const allSoaBySectionService =
  async (sectionId) => {
    const soaRole = await Role.findOne({
      where: { roleName: 'SOA' },
      attributes: ['id'],
    });

    if (!soaRole) {
      return [];
    }

    const users = await User.findAll({
      where: {
        sectionId,
        roleId: soaRole.id,
      },
      attributes: userAttributes,
      include: userContextIncludes,
    });

    return users.map(formatUserResponse);
  };

export const oneUserService = async (id) => {
  const user = await User.findByPk(id, {
    attributes: userAttributes,
    include: userContextIncludes,
  });

  if (!user) {
    const error = new Error(
      "Utilisateur non trouvé.",
    );

    error.statusCode = 404;

    throw error;
  }

  return formatUserResponse(user);
};

const generateTemporaryPassword = (
  length = 10,
) => {
  const characters =
    'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';

  let password = '';

  for (
    let i = 0;
    i < length;
    i += 1
  ) {
    password +=
      characters[
        randomInt(
          0,
          characters.length,
        )
      ];
  }

  return password;
};

const getRoleName = async (roleId) => {
  if (!roleId) return null;

  const role =
    await Role.findByPk(roleId);

  if (!role) {
    const error = new Error(
      "Rôle non trouvé.",
    );

    error.statusCode = 404;

    throw error;
  }

  return role.roleName;
};

const verifierSectionPourSoa = async (
  sectionId,
  userId = null,
) => {
  if (!sectionId) {
    const error = new Error(
      "Un SOA doit être affecté à une section.",
    );

    error.statusCode = 400;

    throw error;
  }

  const section =
    await Section.findByPk(
      sectionId,
    );

  if (!section) {
    const error = new Error(
      "Section non trouvée.",
    );

    error.statusCode = 404;

    throw error;
  }

  if (
    section.chefSectionId &&
    section.chefSectionId !== userId
  ) {
    const error = new Error(
      "Cette section possède déjà un SOA.",
    );

    error.statusCode = 409;

    throw error;
  }

  return section;
};

/*
 * ==========================================
 * SYNCHRONISATION OA / COMPAGNIE
 * ==========================================
 */

const synchroniserOaCompagnie = async (
  userId,
  roleName,
  nouvelleSectionId,
  ancienneSectionId = null,
) => {
  if (!userId) return;

  /*
   * Si l'utilisateur devient OA,
   * on associe automatiquement son compte
   * à la compagnie de sa section.
   */

  if (roleName === 'OA') {
    if (!nouvelleSectionId) {
      return;
    }

    const section =
      await Section.findByPk(
        nouvelleSectionId,
      );

    if (!section) {
      return;
    }

    const compagnie =
      await Compagnie.findByPk(
        section.compagnieId,
      );

    if (!compagnie) {
      return;
    }

    /*
     * Une compagnie ne peut avoir
     * qu'un seul OA.
     */

    if (
      compagnie.oaId &&
      compagnie.oaId !== userId
    ) {
      const error = new Error(
        "Cette compagnie possède déjà un OA.",
      );

      error.statusCode = 409;

      throw error;
    }

    /*
     * Association de l'OA à la compagnie.
     */

    if (
      compagnie.oaId !== userId
    ) {
      await compagnie.update({
        oaId: userId,
      });
    }

    return;
  }

  /*
   * Si l'utilisateur n'est plus OA,
   * on retire son association avec
   * son ancienne compagnie.
   */

  if (!ancienneSectionId) {
    return;
  }

  const ancienneSection =
    await Section.findByPk(
      ancienneSectionId,
    );

  if (!ancienneSection) {
    return;
  }

  const ancienneCompagnie =
    await Compagnie.findByPk(
      ancienneSection.compagnieId,
    );

  if (!ancienneCompagnie) {
    return;
  }

  if (
    ancienneCompagnie.oaId === userId
  ) {
    await ancienneCompagnie.update({
      oaId: null,
    });
  }
};

/*
 * ==========================================
 * AJOUT UTILISATEUR
 * ==========================================
 */

export const addUserService = async (
  userData,
) => {
  if (!userData.email) {
    const error = new Error(
      "L'email est obligatoire.",
    );

    error.statusCode = 400;

    throw error;
  }

  const existingUser =
    await User.findOne({
      where: {
        email: userData.email,
      },
    });

  if (existingUser) {
    const error = new Error(
      "Cet email est déjà utilisé.",
    );

    error.statusCode = 409;

    throw error;
  }

  const roleName =
    await getRoleName(
      userData.roleId,
    );

  const sectionSoa =
    roleName === "SOA"
      ? await verifierSectionPourSoa(
          userData.sectionId,
        )
      : null;

  const temporaryPassword =
    generateTemporaryPassword(10);

  const hashedPassword =
    await hash(
      temporaryPassword,
      10,
    );

  const safeUserData = {
    ...userData,
  };

  delete safeUserData.password;

  const user = await User.create({
    ...safeUserData,
    password: hashedPassword,
  });

  /*
   * Association SOA → section
   */

  if (sectionSoa) {
    await sectionSoa.update({
      chefSectionId: user.id,
    });
  }

  /*
   * Association OA → compagnie
   */

  if (roleName === 'OA') {
    await synchroniserOaCompagnie(
      user.id,
      roleName,
      user.sectionId,
      null,
    );
  }

  const userDataResponse =
    user.toJSON();

  delete userDataResponse.password;

  return {
    user: userDataResponse,
    temporaryPassword,
  };
};

/*
 * ==========================================
 * MODIFICATION UTILISATEUR
 * ==========================================
 */

export const updateUserService = async (
  id,
  userData,
) => {
  if (
    Object.keys(userData).length === 0
  ) {
    const error = new Error(
      "Aucune donnée à mettre à jour.",
    );

    error.statusCode = 400;

    throw error;
  }

  const user =
    await User.findByPk(id);

  if (!user) {
    const error = new Error(
      "Utilisateur non trouvé.",
    );

    error.statusCode = 404;

    throw error;
  }

  const ancienRoleName =
    await getRoleName(
      user.roleId,
    );

  const nouveauRoleId =
    userData.roleId ??
    user.roleId;

  const nouveauRoleName =
    await getRoleName(
      nouveauRoleId,
    );

  const ancienneSectionId =
    user.sectionId;

  const nouvelleSectionId =
    userData.sectionId ??
    user.sectionId;

  let nouvelleSectionSoa =
    null;

  /*
   * Vérification SOA
   */

  if (
    nouveauRoleName === "SOA"
  ) {
    nouvelleSectionSoa =
      await verifierSectionPourSoa(
        nouvelleSectionId,
        user.id,
      );
  }

  /*
   * Mot de passe
   */

  if (userData.password) {
    userData.password =
      await hash(
        userData.password,
        10,
      );
  }

  /*
   * Mise à jour utilisateur
   */
  if (
    typeof userData.email === "string"
  ) {
    userData.email =
      userData.email.trim() !== ""
        ? userData.email.trim()
        : null;
  }

  await user.update(userData);

  /*
   * Synchronisation OA / compagnie
   */

  await synchroniserOaCompagnie(
    user.id,
    nouveauRoleName,
    nouvelleSectionId,
    ancienneSectionId,
  );

  /*
   * Gestion de l'ancien SOA
   */

  const quitteAncienneSectionSoa =
    ancienRoleName === "SOA" &&
    (
      nouveauRoleName !== "SOA" ||
      ancienneSectionId !==
        nouvelleSectionId
    );

  if (
    quitteAncienneSectionSoa &&
    ancienneSectionId
  ) {
    const ancienneSection =
      await Section.findByPk(
        ancienneSectionId,
      );

    if (
      ancienneSection?.chefSectionId ===
      user.id
    ) {
      await ancienneSection.update({
        chefSectionId: null,
      });
    }
  }

  /*
   * Association du nouveau SOA
   */

  if (
    nouvelleSectionSoa &&
    nouvelleSectionSoa.chefSectionId !==
      user.id
  ) {
    await nouvelleSectionSoa.update({
      chefSectionId: user.id,
    });
  }

  const userDataResponse =
    user.toJSON();

  delete userDataResponse.password;

  return userDataResponse;
};

/*
 * ==========================================
 * SUPPRESSION UTILISATEUR
 * ==========================================
 */

export const deleteUserService = async (
  id,
) => {
  const user =
    await User.findByPk(id);

  if (!user) {
    const error = new Error(
      "Utilisateur non trouvé.",
    );

    error.statusCode = 404;

    throw error;
  }

  /*
   * Retirer le SOA de sa section
   */

  const sectionDirigee =
    await Section.findOne({
      where: {
        chefSectionId: user.id,
      },
    });

  if (sectionDirigee) {
    await sectionDirigee.update({
      chefSectionId: null,
    });
  }

  /*
   * Retirer l'OA de sa compagnie
   */

  await Compagnie.update(
    {
      oaId: null,
    },
    {
      where: {
        oaId: user.id,
      },
    },
  );

  await user.destroy();
};