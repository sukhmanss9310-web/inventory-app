import { Product } from "../models/Product.js";
import { createError } from "../utils/errors.js";
import { createActivityLog } from "./activityLogService.js";

const serializeProduct = (product) => ({
  id: product._id,
  name: product.name,
  sku: product.sku,
  stock: product.stock,
  lowStockThreshold: product.lowStockThreshold,
  isLowStock: product.stock <= product.lowStockThreshold,
  createdAt: product.createdAt,
  updatedAt: product.updatedAt
});

export const listProducts = async ({ search }) => {
  const filters = {};

  if (search) {
    const pattern = new RegExp(search, "i");
    filters.$or = [{ name: pattern }, { sku: pattern }];
  }

  const products = await Product.find(filters).sort({ stock: 1, name: 1 }).lean();

  return products.map((product) => ({
    id: product._id,
    name: product.name,
    sku: product.sku,
    stock: product.stock,
    lowStockThreshold: product.lowStockThreshold,
    isLowStock: product.stock <= product.lowStockThreshold,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt
  }));
};

export const getProductById = async (productId) => {
  const product = await Product.findById(productId);

  if (!product) {
    throw createError("Product not found", 404);
  }

  return serializeProduct(product);
};

export const createProduct = async (payload, user) => {
  const product = await Product.create({
    ...payload,
    sku: payload.sku.toUpperCase(),
    createdBy: user._id,
    updatedBy: user._id
  });

  await createActivityLog({
    actorId: user._id,
    actorName: user.name,
    actorRole: user.role,
    action: "product_created",
    entityType: "product",
    entityId: product._id,
    productId: product._id,
    productName: product.name,
    message: `${user.name} added ${product.name} with opening stock ${product.stock}.`,
    metadata: {
      sku: product.sku,
      lowStockThreshold: product.lowStockThreshold
    }
  });

  return serializeProduct(product);
};

export const updateProduct = async (productId, payload, user) => {
  const product = await Product.findById(productId);

  if (!product) {
    throw createError("Product not found", 404);
  }

  const previousStock = product.stock;

  product.name = payload.name;
  product.sku = payload.sku.toUpperCase();
  product.stock = payload.stock;
  product.lowStockThreshold = payload.lowStockThreshold;
  product.updatedBy = user._id;

  await product.save();

  await createActivityLog({
    actorId: user._id,
    actorName: user.name,
    actorRole: user.role,
    action: "product_updated",
    entityType: "product",
    entityId: product._id,
    productId: product._id,
    productName: product.name,
    message: `${user.name} updated ${product.name}. Stock changed from ${previousStock} to ${product.stock}.`,
    metadata: {
      sku: product.sku,
      previousStock,
      updatedStock: product.stock,
      lowStockThreshold: product.lowStockThreshold
    }
  });

  return serializeProduct(product);
};

export const deleteProduct = async (productId, user) => {
  const product = await Product.findById(productId);

  if (!product) {
    throw createError("Product not found", 404);
  }

  await product.deleteOne();

  await createActivityLog({
    actorId: user._id,
    actorName: user.name,
    actorRole: user.role,
    action: "product_deleted",
    entityType: "product",
    entityId: product._id,
    productId: product._id,
    productName: product.name,
    message: `${user.name} deleted ${product.name}.`,
    metadata: {
      sku: product.sku
    }
  });
};
