"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("sections", {
      fields: ["sectionName", "compagnieId"],
      type: "unique",
      name: "sections_section_name_compagnie_id_key",
    });

    await queryInterface.addConstraint("missions_users", {
      fields: ["missionId", "userId"],
      type: "unique",
      name: "missions_users_mission_id_user_id_key",
    });
    await queryInterface.addConstraint("missions_vehicules", {
      fields: ["missionId", "vehiculeId"],
      type: "unique",
      name: "missions_vehicules_mission_id_vehicule_id_key",
    });
    await queryInterface.addConstraint("missions_equipages", {
      fields: ["missionVehiculeId", "userId"],
      type: "unique",
      name: "missions_equipages_mission_vehicule_id_user_id_key",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint(
      "missions_equipages",
      "missions_equipages_mission_vehicule_id_user_id_key",
    );
    await queryInterface.removeConstraint(
      "missions_vehicules",
      "missions_vehicules_mission_id_vehicule_id_key",
    );
    await queryInterface.removeConstraint(
      "missions_users",
      "missions_users_mission_id_user_id_key",
    );
    await queryInterface.removeConstraint(
      "sections",
      "sections_section_name_compagnie_id_key",
    );
  },
};
