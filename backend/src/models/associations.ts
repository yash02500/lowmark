import User from "./User";
import Product from "./product";
import UserProduct from "./userProduct";
import PriceHistory from "./priceHistory";

User.hasMany(UserProduct, {
    foreignKey: "userId",
});

UserProduct.belongsTo(User, {
    foreignKey: "userId",
});

Product.hasMany(UserProduct, {
    foreignKey: "productId",
});

UserProduct.belongsTo(Product, {
    foreignKey: "productId",
    as: "product",
});

Product.hasMany(PriceHistory, {
  foreignKey: "productId",
  as: "priceHistory",
});

PriceHistory.belongsTo(Product, {
  foreignKey: "productId",
  as: "product",
});