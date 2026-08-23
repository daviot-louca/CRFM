import { Sequelize } from "sequelize";
import sequelize from "../config/db.config.js";

import Mission from "./missions.model.js";
import MissionsUsers from "./missionsUsers.model.js";
import MissionsVehicule from "./missionsVehicule.model.js";
import MissionsEquipages from "./missions-equipages.model.js";
import MissionsGroupes from "./missionsGroupes.model.js";
import Role from "./roles.model.js";
import Section from "./sections.model.js";
import User from "./user.model.js";
import UserToken from "./userToken.model.js";
import Vehicule from "./vehicule.model.js";
import VehiculeType from "./vehicules-types.model.js";
import Compagnie from "./compagnie.model.js";

const db = {
  Sequelize,
  sequelize,
  Mission,
  MissionsGroupes,
  MissionsUsers,
  MissionsVehicule,
  MissionsEquipages,
  Role,
  Section,
  User,
  UserToken,
  Vehicule,
  VehiculeType,
  Compagnie,
};

Role.hasMany(User, {
  foreignKey: "roleId",
  as: "users",
  onDelete: "RESTRICT",
});
User.belongsTo(Role, {
  foreignKey: "roleId",
  as: "role",
});

User.hasOne(Section, {
  foreignKey: "chefSectionId",
  as: "sectionDirigee",
  onDelete: "SET NULL",
});
Section.belongsTo(User, {
  foreignKey: "chefSectionId",
  as: "chefSection",
});

Compagnie.hasMany(Section, {
  foreignKey: "compagnieId",
  as: "sections",
  onDelete: "RESTRICT",
});

Section.belongsTo(Compagnie, {
  foreignKey: "compagnieId",
  as: "compagnie",
});

User.hasOne(Compagnie, {
  foreignKey: "oaId",
  as: "compagnieOA",
  onDelete: "RESTRICT",
});

Compagnie.belongsTo(User, {
  foreignKey: "oaId",
  as: "oa",
});

Section.hasMany(User, {
  foreignKey: "sectionId",
  as: "users",
  onDelete: "RESTRICT",
});
User.belongsTo(Section, {
  foreignKey: "sectionId",
  as: "section",
});

VehiculeType.hasMany(Vehicule, {
  foreignKey: "vehiculeTypeId",
  as: "vehicules",
  onDelete: "RESTRICT",
});
Vehicule.belongsTo(VehiculeType, {
  foreignKey: "vehiculeTypeId",
  as: "vehiculeType",
});

User.hasMany(UserToken, {
  foreignKey: "userId",
  as: "tokens",
  onDelete: "CASCADE",
});
UserToken.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

Mission.belongsToMany(User, {
  through: MissionsUsers,
  foreignKey: "missionId",
  otherKey: "userId",
  as: "users",
});
User.belongsToMany(Mission, {
  through: MissionsUsers,
  foreignKey: "userId",
  otherKey: "missionId",
  as: "missions",
});

Mission.belongsToMany(Vehicule, {
  through: MissionsVehicule,
  foreignKey: "missionId",
  otherKey: "vehiculeId",
  as: "vehicules",
});
Vehicule.belongsToMany(Mission, {
  through: MissionsVehicule,
  foreignKey: "vehiculeId",
  otherKey: "missionId",
  as: "missions",
});

Mission.hasMany(MissionsUsers, {
  foreignKey: "missionId",
  as: "missionsUsers",
  onDelete: "CASCADE",
});
MissionsUsers.belongsTo(Mission, {
  foreignKey: "missionId",
  as: "mission",
});

Mission.hasMany(MissionsGroupes, {
  foreignKey: "missionId",
  as: "groupes",
  onDelete: "CASCADE",
});

MissionsGroupes.belongsTo(Mission, {
  foreignKey: "missionId",
  as: "mission",
});
User.hasMany(MissionsUsers, {
  foreignKey: "userId",
  as: "missionsUsers",
  onDelete: "CASCADE",
});
MissionsUsers.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

Section.hasMany(MissionsUsers, {
  foreignKey: "sectionId",
  as: "missionsUsers",
  onDelete: "RESTRICT",
});

MissionsUsers.belongsTo(Section, {
  foreignKey: "sectionId",
  as: "sectionMission",
});

MissionsGroupes.hasMany(MissionsUsers, {
  foreignKey: "missionGroupeId",
  as: "utilisateurs",
  onDelete: "SET NULL",
});

MissionsUsers.belongsTo(MissionsGroupes, {
  foreignKey: "missionGroupeId",
  as: "groupe",
});

Mission.hasMany(MissionsVehicule, {
  foreignKey: "missionId",
  as: "missionsVehicules",
  onDelete: "CASCADE",
});
MissionsVehicule.belongsTo(Mission, {
  foreignKey: "missionId",
  as: "mission",
});
Vehicule.hasMany(MissionsVehicule, {
  foreignKey: "vehiculeId",
  as: "missionsVehicules",
  onDelete: "CASCADE",
});
MissionsVehicule.belongsTo(Vehicule, {
  foreignKey: "vehiculeId",
  as: "vehicule",
});

Section.hasMany(MissionsVehicule, {
  foreignKey: "sectionId",
  as: "missionsVehicules",
  onDelete: "RESTRICT",
});

MissionsVehicule.belongsTo(Section, {
  foreignKey: "sectionId",
  as: "section",
});

MissionsVehicule.hasMany(MissionsEquipages, {
  foreignKey: "missionVehiculeId",
  as: "equipages",
  onDelete: "CASCADE",
});

MissionsEquipages.belongsTo(MissionsVehicule, {
  foreignKey: "missionVehiculeId",
  as: "missionVehicule",
});

User.hasMany(MissionsEquipages, {
  foreignKey: "userId",
  as: "equipages",
  onDelete: "CASCADE",
});

MissionsEquipages.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

Compagnie.hasMany(MissionsVehicule, {
  foreignKey: "compagnieId",
  as: "missionsVehicules",
  onDelete: "RESTRICT",
});

MissionsVehicule.belongsTo(Compagnie, {
  foreignKey: "compagnieId",
  as: "compagnie",
});

MissionsGroupes.hasMany(MissionsVehicule, {
  foreignKey: "missionGroupeId",
  as: "vehicules",
  onDelete: "SET NULL",
});

MissionsVehicule.belongsTo(MissionsGroupes, {
  foreignKey: "missionGroupeId",
  as: "groupe",
});

User.hasMany(Mission, {
  foreignKey: "oaId",
  as: "missionsCommandees",
});

Mission.belongsTo(User, {
  foreignKey: "oaId",
  as: "oa",
});

User.hasMany(MissionsGroupes, {
  foreignKey: "soaId",
  as: "groupesCommandes",
});

MissionsGroupes.belongsTo(User, {
  foreignKey: "soaId",
  as: "soa",
});
export {
  sequelize,
  Mission,
  MissionsGroupes,
  MissionsUsers,
  MissionsVehicule,
  MissionsEquipages,
  Role,
  Section,
  User,
  UserToken,
  Vehicule,
  VehiculeType,
  Compagnie,
};

export default db;
