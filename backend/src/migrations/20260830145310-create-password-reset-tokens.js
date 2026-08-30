'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable(
      "password_reset_tokens",
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
          references: {
              model: "users",
              key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
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

        usedAt: {
          type: Sequelize.DATE,
          allowNull: true,
        },

        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue:
              Sequelize.literal(
                  "CURRENT_TIMESTAMP"
              ),
        },

        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue:
              Sequelize.literal(
                  "CURRENT_TIMESTAMP"
              ),
        },
      }
    );

    await queryInterface.addIndex(
        "password_reset_tokens",
        ["userId"]
    );

    await queryInterface.addIndex(
        "password_reset_tokens",
        ["expiresAt"]
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropAllTables(
      "password_reset_tokens"
    );
  },
};
