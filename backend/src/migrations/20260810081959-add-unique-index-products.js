'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface) {
    await queryInterface.addIndex("user_products", ["userId", "productId"], {
      unique: true,
      name: "unique_user_product",
    });
  },

  async down (queryInterface) {
    await queryInterface.removeIndex(
      "user_products",
      "unique_user_product"
    );
  },
};
