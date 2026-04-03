import {
  createProduct,
  deleteProduct,
  getProductById,
  importProducts,
  listProducts,
  updateProduct
} from "../services/productService.js";

export const getProducts = async (req, res) => {
  const products = await listProducts(req.query, req.user.companyId);

  return res.json({ products });
};

export const getProduct = async (req, res) => {
  const product = await getProductById(req.params.productId, req.user.companyId);

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

export const importProductsHandler = async (req, res) => {
  const result = await importProducts(req.body, req.user, req.company);

  return res.status(201).json({
    message: "Inventory imported successfully",
    ...result
  });
};
