'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable("products", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },

      url: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      imageUrl: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      currentPrice: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },

      platform: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: "INR",
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
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable("products");
  }
};
