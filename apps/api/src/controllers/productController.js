import {
  createProduct,
  deleteProduct,
  getProductById,
  listProducts,
  updateProduct
} from "../services/productService.js";

export const getProducts = async (req, res) => {
  const products = await listProducts(req.query);

  return res.json({ products });
};

export const getProduct = async (req, res) => {
  const product = await getProductById(req.params.productId);

  return res.json({ product });
};

export const createProductHandler = async (req, res) => {
  const product = await createProduct(req.body, req.user);

  return res.status(201).json({
    message: "Product created successfully",
    product
  });
};

export const updateProductHandler = async (req, res) => {
  const product = await updateProduct(req.params.productId, req.body, req.user);

  return res.json({
    message: "Product updated successfully",
    product
  });
};

export const deleteProductHandler = async (req, res) => {
  await deleteProduct(req.params.productId, req.user);

  return res.json({
    message: "Product deleted successfully"
  });
};
