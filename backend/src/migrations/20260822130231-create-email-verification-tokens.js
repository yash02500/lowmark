'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "email_verification_tokens",
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          allowNull: false,
          primaryKey: true,
        },

        userId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },

        tokenHash: {
          type: Sequelize.STRING(64),
          allowNull: false,
          unique: true,
        },

        expiresAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },

        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },

        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
      }
    );

    await queryInterface.addIndex(
      "email_verification_tokens",
      ["userId"]
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable(
      "email_verification_tokens"
    );
  },
};