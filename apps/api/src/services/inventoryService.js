import { Dispatch } from "../models/Dispatch.js";
import { Product } from "../models/Product.js";
import { InventoryReturn } from "../models/Return.js";
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

const serializeDispatch = (record) => ({
  id: record._id,
  productId: record.productId,
  productName: record.productName,
  sku: record.sku,
  quantity: record.quantity,
  staffId: record.staffId,
  staffName: record.staffName,
  note: record.note,
  date: record.date
});

const serializeReturn = (record) => ({
  id: record._id,
  productId: record.productId,
  productName: record.productName,
  sku: record.sku,
  quantity: record.quantity,
  type: record.type,
  staffId: record.staffId,
  staffName: record.staffName,
  note: record.note,
  date: record.date
});

export const createDispatch = async ({ productId, quantity, note = "" }, user) => {
  const product = await Product.findOneAndUpdate(
    { _id: productId, stock: { $gte: quantity } },
    { $inc: { stock: -quantity } },
    { new: true }
  );

  if (!product) {
    const existingProduct = await Product.findById(productId);

    if (!existingProduct) {
      throw createError("Product not found", 404);
    }

    throw createError("Insufficient stock for this dispatch", 400);
  }

  try {
    const dispatchRecord = await Dispatch.create({
      productId: product._id,
      productName: product.name,
      sku: product.sku,
      quantity,
      staffId: user._id,
      staffName: user.name,
      note
    });

    await createActivityLog({
      actorId: user._id,
      actorName: user.name,
      actorRole: user.role,
      action: "dispatch_created",
      entityType: "dispatch",
      entityId: dispatchRecord._id,
      productId: product._id,
      productName: product.name,
      quantity,
      movementType: "dispatch",
      message: `${user.name} dispatched ${quantity} unit${quantity > 1 ? "s" : ""} of ${product.name}.`,
      metadata: {
        sku: product.sku,
        remainingStock: product.stock,
        note
      }
    });

    return {
      dispatch: serializeDispatch(dispatchRecord),
      product: serializeProduct(product)
    };
  } catch (error) {
    // Roll stock back if the audit records fail after the stock decrement succeeds.
    await Product.findByIdAndUpdate(productId, { $inc: { stock: quantity } });
    throw error;
  }
};

export const addReturn = async ({ productId, quantity, type, note = "" }, user) => {
  const product = await Product.findByIdAndUpdate(
    productId,
    { $inc: { stock: quantity } },
    { new: true }
  );

  if (!product) {
    throw createError("Product not found", 404);
  }

  try {
    const returnRecord = await InventoryReturn.create({
      productId: product._id,
      productName: product.name,
      sku: product.sku,
      quantity,
      type,
      staffId: user._id,
      staffName: user.name,
      note
    });

    await createActivityLog({
      actorId: user._id,
      actorName: user.name,
      actorRole: user.role,
      action: "return_created",
      entityType: "return",
      entityId: returnRecord._id,
      productId: product._id,
      productName: product.name,
      quantity,
      movementType: type,
      message: `${user.name} added a ${type} of ${quantity} unit${quantity > 1 ? "s" : ""} for ${product.name}.`,
      metadata: {
        sku: product.sku,
        updatedStock: product.stock,
        note
      }
    });

    return {
      returnEntry: serializeReturn(returnRecord),
      product: serializeProduct(product)
    };
  } catch (error) {
    // Keep stock consistent if the return log cannot be stored.
    await Product.findByIdAndUpdate(productId, { $inc: { stock: -quantity } });
    throw error;
  }
};
