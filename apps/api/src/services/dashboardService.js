import { Dispatch } from "../models/Dispatch.js";
import { ActivityLog } from "../models/ActivityLog.js";
import { Product } from "../models/Product.js";
import { InventoryReturn } from "../models/Return.js";

const getRangeStarts = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const week = new Date(today);
  week.setDate(week.getDate() - 6);

  return { today, week };
};

const getTotalQuantity = async (Model, match = {}) => {
  const [result] = await Model.aggregate([
    { $match: match },
    { $group: { _id: null, total: { $sum: "$quantity" } } }
  ]);

  return result?.total || 0;
};

export const getDashboardSummary = async () => {
  const { today, week } = getRangeStarts();

  const [
    inventorySummary,
    lowStockItems,
    dispatchedAllTime,
    dispatchedToday,
    dispatchedLast7Days,
    returnsAllTime,
    returnsToday,
    returnsLast7Days,
    recentActivity
  ] = await Promise.all([
    Product.aggregate([
      {
        $group: {
          _id: null,
          totalStock: { $sum: "$stock" },
          totalProducts: { $sum: 1 }
        }
      }
    ]),
    Product.find({
      $expr: { $lte: ["$stock", "$lowStockThreshold"] }
    })
      .sort({ stock: 1, name: 1 })
      .select("name sku stock lowStockThreshold")
      .lean(),
    getTotalQuantity(Dispatch),
    getTotalQuantity(Dispatch, { date: { $gte: today } }),
    getTotalQuantity(Dispatch, { date: { $gte: week } }),
    getTotalQuantity(InventoryReturn),
    getTotalQuantity(InventoryReturn, { date: { $gte: today } }),
    getTotalQuantity(InventoryReturn, { date: { $gte: week } }),
    ActivityLog.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()
  ]);

  const summary = inventorySummary[0] || { totalStock: 0, totalProducts: 0 };

  return {
    metrics: {
      totalStock: summary.totalStock,
      totalProducts: summary.totalProducts,
      lowStockItemsCount: lowStockItems.length,
      dispatchedAllTime,
      dispatchedToday,
      dispatchedLast7Days,
      returnsAllTime,
      returnsToday,
      returnsLast7Days
    },
    lowStockItems: lowStockItems.map((product) => ({
      id: product._id,
      name: product.name,
      sku: product.sku,
      stock: product.stock,
      lowStockThreshold: product.lowStockThreshold
    })),
    recentActivity: recentActivity.map((item) => ({
      id: item._id,
      actorName: item.actorName,
      actorRole: item.actorRole,
      message: item.message,
      createdAt: item.createdAt
    }))
  };
};
