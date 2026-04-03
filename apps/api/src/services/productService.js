import { Product } from "../models/Product.js";
import { createError } from "../utils/errors.js";
import { loadGoogleSheetRows, normalizeImportRows } from "../utils/spreadsheetImport.js";
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

export const listProducts = async ({ search }, companyId) => {
  const filters = { companyId };

  if (!filters.companyId) {
    throw createError("Company context is required", 500);
  }

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

export const getProductById = async (productId, companyId) => {
  const product = await Product.findOne({ _id: productId, companyId });

  if (!product) {
    throw createError("Product not found", 404);
  }

  return serializeProduct(product);
};

export const createProduct = async (payload, user) => {
  const product = await Product.create({
    ...payload,
    companyId: user.companyId,
    sku: payload.sku.toUpperCase(),
    createdBy: user._id,
    updatedBy: user._id
  });

  await createActivityLog({
    companyId: user.companyId,
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
  const product = await Product.findOne({ _id: productId, companyId: user.companyId });

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
    companyId: user.companyId,
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
  const product = await Product.findOne({ _id: productId, companyId: user.companyId });

  if (!product) {
    throw createError("Product not found", 404);
  }

  await product.deleteOne();

  await createActivityLog({
    companyId: user.companyId,
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

export const importProducts = async ({ rows, sheetUrl, sourceLabel = "" }, user, company) => {
  const importedRows = sheetUrl ? await loadGoogleSheetRows(sheetUrl) : rows;
  const normalizedRows = normalizeImportRows(importedRows);
  const skus = normalizedRows.map((row) => row.sku);

  const existingProducts = await Product.find({
    companyId: user.companyId,
    sku: { $in: skus }
  });

  const existingProductsBySku = new Map(
    existingProducts.map((product) => [product.sku.toUpperCase(), product])
  );

  const productsToCreate = [];
  const updateOperations = [];
  let updatedCount = 0;
  let unchangedCount = 0;

  normalizedRows.forEach((row) => {
    const existingProduct = existingProductsBySku.get(row.sku);

    if (!existingProduct) {
      productsToCreate.push({
        companyId: user.companyId,
        name: row.name,
        sku: row.sku,
        stock: row.stock,
        lowStockThreshold: row.lowStockThreshold,
        createdBy: user._id,
        updatedBy: user._id
      });
      return;
    }

    const isUnchanged =
      existingProduct.name === row.name &&
      existingProduct.stock === row.stock &&
      existingProduct.lowStockThreshold === row.lowStockThreshold;

    if (isUnchanged) {
      unchangedCount += 1;
      return;
    }

    updatedCount += 1;
    updateOperations.push({
      updateOne: {
        filter: {
          _id: existingProduct._id,
          companyId: user.companyId
        },
        update: {
          $set: {
            name: row.name,
            sku: row.sku,
            stock: row.stock,
            lowStockThreshold: row.lowStockThreshold,
            updatedBy: user._id
          }
        }
      }
    });
  });

  let createdCount = 0;

  if (productsToCreate.length > 0) {
    const createdProducts = await Product.insertMany(productsToCreate);
    createdCount = createdProducts.length;
  }

  if (updateOperations.length > 0) {
    await Product.bulkWrite(updateOperations);
  }

  await createActivityLog({
    companyId: user.companyId,
    actorId: user._id,
    actorName: user.name,
    actorRole: user.role,
    action: "inventory_imported",
    entityType: "company",
    entityId: company._id,
    message: `${user.name} imported inventory for ${normalizedRows.length} row(s). Created ${createdCount}, updated ${updatedCount}, unchanged ${unchangedCount}.`,
    metadata: {
      companyCode: company.code,
      companyName: company.name,
      sourceType: sheetUrl ? "google_sheet" : "spreadsheet",
      sourceLabel: sourceLabel || sheetUrl || "Spreadsheet upload",
      totalRows: normalizedRows.length,
      createdCount,
      updatedCount,
      unchangedCount
    }
  });

  return {
    summary: {
      totalRows: normalizedRows.length,
      createdCount,
      updatedCount,
      unchangedCount,
      sourceType: sheetUrl ? "google_sheet" : "spreadsheet",
      sourceLabel: sourceLabel || sheetUrl || "Spreadsheet upload"
    }
  };
};
