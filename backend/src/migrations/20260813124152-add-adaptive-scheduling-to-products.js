'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("products", "lastCheckedAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("products", "nextCheckAt", {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    });

    await queryInterface.addColumn("products", "checkIntervalMinutes", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 60,
    });

    await queryInterface.addColumn("products", "priority", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.addColumn("products", "trackingState", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "active",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("products", "trackingState");
    await queryInterface.removeColumn("products", "priority");
    await queryInterface.removeColumn(
      "products",
      "checkIntervalMinutes"
    );
    await queryInterface.removeColumn("products", "nextCheckAt");
    await queryInterface.removeColumn("products", "lastCheckedAt");
  },
};