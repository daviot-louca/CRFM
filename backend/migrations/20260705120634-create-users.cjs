"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      grade: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      nom: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      phoneNumber:{
        type: Sequelize.INTEGER,
        allowNull:true,
        unique:true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      section_id: {
        type: Sequelize.UUID,
        references: {
          model: "sections",
          key: "id",
        },
        allowNull: false,
      },
      role_id: {
        type: Sequelize.UUID,
        references: {
          model: "roles",
          key: "id",
        },
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addConstraint("sections", {
      fields: ["chefSectionId"],
      type: "foreign key",
      name: "sections_chefSectionId_fkey",
      references: {
        table: "users",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      "sections",
      "sections_chefSectionId_fkey",
    );
    await queryInterface.dropTable("users");
  },
};
