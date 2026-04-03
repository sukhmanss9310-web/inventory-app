import mongoose from "mongoose";
import { Dispatch } from "../models/Dispatch.js";
import { ActivityLog } from "../models/ActivityLog.js";
import { Product } from "../models/Product.js";
import { InventoryReturn } from "../models/Return.js";
import { normalizeCompanyCode } from "../utils/company.js";
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
    { _id: productId, companyId: user.companyId, stock: { $gte: quantity } },
    { $inc: { stock: -quantity } },
    { new: true }
  );

  if (!product) {
    const existingProduct = await Product.findOne({ _id: productId, companyId: user.companyId });

    if (!existingProduct) {
      throw createError("Product not found", 404);
    }

    throw createError("Insufficient stock for this dispatch", 400);
  }

  try {
    const dispatchRecord = await Dispatch.create({
      companyId: user.companyId,
      productId: product._id,
      productName: product.name,
      sku: product.sku,
      quantity,
      staffId: user._id,
      staffName: user.name,
      note
    });

    await createActivityLog({
      companyId: user.companyId,
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
    await Product.findOneAndUpdate(
      { _id: productId, companyId: user.companyId },
      { $inc: { stock: quantity } }
    );
    throw error;
  }
};

export const addReturn = async ({ productId, quantity, type, note = "" }, user) => {
  const product = await Product.findOneAndUpdate(
    { _id: productId, companyId: user.companyId },
    { $inc: { stock: quantity } },
    { new: true }
  );

  if (!product) {
    throw createError("Product not found", 404);
  }

  try {
    const returnRecord = await InventoryReturn.create({
      companyId: user.companyId,
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
      companyId: user.companyId,
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
    await Product.findOneAndUpdate(
      { _id: productId, companyId: user.companyId },
      { $inc: { stock: -quantity } }
    );
    throw error;
  }
};

export const resetInventoryStock = async ({ productId, stock, reason }, user) => {
  const product = await Product.findOne({ _id: productId, companyId: user.companyId });

  if (!product) {
    throw createError("Product not found", 404);
  }

  const previousStock = product.stock;

  product.stock = stock;
  product.updatedBy = user._id;
  await product.save();

  await createActivityLog({
    companyId: user.companyId,
    actorId: user._id,
    actorName: user.name,
    actorRole: user.role,
    action: "inventory_adjusted",
    entityType: "product",
    entityId: product._id,
    productId: product._id,
    productName: product.name,
    quantity: Math.abs(previousStock - stock),
    message: `${user.name} reset ${product.name} stock from ${previousStock} to ${stock}. Reason: ${reason}`,
    metadata: {
      sku: product.sku,
      previousStock,
      updatedStock: stock,
      reason
    }
  });

  return {
    product: serializeProduct(product)
  };
};

export const resetCompanyInventory = async ({ confirmation, reason }, user, company) => {
  if (!company) {
    throw createError("Company context is required", 500);
  }

  if (normalizeCompanyCode(confirmation) !== company.code) {
    throw createError("Enter the exact company code to confirm this reset", 400);
  }

  const session = await mongoose.startSession();

  try {
    let summary = {
      productsReset: 0,
      previousTotalStock: 0,
      dispatchesCleared: 0,
      returnsCleared: 0,
      logsCleared: 0
    };

    await session.withTransaction(async () => {
      const products = await Product.find({ companyId: user.companyId }, null, { session });

      summary.productsReset = products.length;
      summary.previousTotalStock = products.reduce(
        (total, product) => total + Number(product.stock || 0),
        0
      );

      await Product.updateMany(
        { companyId: user.companyId },
        {
          $set: {
            stock: 0,
            updatedBy: user._id
          }
        },
        { session }
      );

      const [dispatchResult, returnResult, logResult] = await Promise.all([
        Dispatch.deleteMany({ companyId: user.companyId }, { session }),
        InventoryReturn.deleteMany({ companyId: user.companyId }, { session }),
        ActivityLog.deleteMany({ companyId: user.companyId }, { session })
      ]);

      summary.dispatchesCleared = dispatchResult.deletedCount || 0;
      summary.returnsCleared = returnResult.deletedCount || 0;
      summary.logsCleared = logResult.deletedCount || 0;

      await createActivityLog(
        {
          companyId: user.companyId,
          actorId: user._id,
          actorName: user.name,
          actorRole: user.role,
          action: "company_reset",
          entityType: "company",
          entityId: company._id,
          message: `${user.name} reset all inventory data for ${company.name}. Reason: ${reason}`,
          metadata: {
            companyCode: company.code,
            companyName: company.name,
            reason,
            productsReset: summary.productsReset,
            previousTotalStock: summary.previousTotalStock,
            dispatchesCleared: summary.dispatchesCleared,
            returnsCleared: summary.returnsCleared,
            logsCleared: summary.logsCleared
          }
        },
        { session }
      );
    });

    return { summary };
  } finally {
    await session.endSession();
  }
};
