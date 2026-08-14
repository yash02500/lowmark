import Product from "../models/product";
import { Op } from "sequelize";

const createProduct = async (productData: {
  url: string;
  title: string;
  imageUrl?: string;
  currentPrice: number;
  platform: string;
  currency?: string;
}) => {
  return await Product.create(productData);
};

const findProductById = async (id: number) => {
  return await Product.findByPk(id);
};

const findProductByUrl = async (url: string) => {
  return await Product.findOne({
    where: {
      url,
    },
  });
};

const findAllProducts = async () => {
  return await Product.findAll();
};

const deleteProduct = async (id: number) => {
  return await Product.destroy({
    where: { id },
  });
};

const updateProductPrice = async (
  id: number,
  currentPrice: number
) => {
  return await Product.update(
    { currentPrice },
    {
      where: { id },
    }
  );
};

const findProductsDueForCheck = async () => {
  return await Product.findAll({
    where: {
      nextCheckAt: {
        [Op.lte]: new Date(),
      },
    },
    order: [
      ["priority", "DESC"],
      ["nextCheckAt", "ASC"],
    ],
  });
};

const updateScheduling = async (
  productId: number,
  data: {
    lastCheckedAt: Date;
    nextCheckAt: Date;
    checkIntervalMinutes: number;
    priority: number;
    trackingState: string;
  }
) => {
  return await Product.update(data, {
    where: {
      id: productId,
    },
  });
};

export default {
  createProduct,
  findProductById,
  findProductByUrl,
  findAllProducts,
  deleteProduct,
  updateProductPrice,
  findProductsDueForCheck,
  updateScheduling
}