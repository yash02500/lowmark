import Product from "../models/product";

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

const findAllProducts = async () => {
  return await Product.findAll();
};

const deleteProduct = async (id: number) => {
  return await Product.destroy({
    where: { id },
  });
};

export default {
    createProduct,
    findProductById,
    findAllProducts,
    deleteProduct,
}