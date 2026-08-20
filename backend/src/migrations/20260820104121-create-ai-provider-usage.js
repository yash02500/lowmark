'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("ai_provider_usage", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },

      provider: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      usageDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },

      requestCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      unavailable: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addIndex(
      "ai_provider_usage",
      ["provider", "usageDate"],
      {
        unique: true,
        name: "unique_ai_provider_usage_date",
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("ai_provider_usage");
  },
};