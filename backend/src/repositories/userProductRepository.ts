import UserProduct from "../models/userProduct";
import Product from "../models/product";
import { Model } from "sequelize";

const createUserProduct = async (userProductData: {
    userId: number;
    productId: number;
    targetPrice?: number;
    isActive?: boolean;
}) => {
    return await UserProduct.create(userProductData);
};

const findUserProduct = async (
    userId: number,
    productId: number
) => {
    return await UserProduct.findOne({
        where: {
            userId,
            productId,
        },
    });
};

const findUserProducts = async (userId: number) => {
    return await UserProduct.findAll({
        where: {
            userId,
        },
        include: [
            {
                model: Product,
                as: "product",
            }
        ],
    });
};

const findUserProductById = async (
    id: number,
    userId: number
) => {
    return await UserProduct.findOne({
        where: {
            id,
            userId,
        },
        include: [
            {
                model: Product,
                as: "product",
            }
        ],
    });
};

const deleteUserProduct = async (
    id: number,
    userId: number
) => {
    return await UserProduct.destroy({
        where: {
            id,
            userId,
        },
    });
};

const findActiveUserProducts = async () => {
    return await UserProduct.findAll({
        where: {
            isActive: true,
        },
        include: [
            {
                model: Product,
                as: "product",
            },
        ],
    });
};

export default {
    createUserProduct,
    findUserProduct,
    findUserProducts,
    findUserProductById,
    deleteUserProduct,
    findActiveUserProducts
};