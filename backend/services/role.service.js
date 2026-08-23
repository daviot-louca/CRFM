

import Role from "../models/roles.model.js";

export const getRolesService = async () => {
  return Role.findAll({
    attributes: ["id", "roleName"],
    order: [["roleName", "ASC"]],
  });
};