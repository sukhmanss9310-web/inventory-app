import { Dispatch } from "../models/Dispatch.js";
import { ActivityLog } from "../models/ActivityLog.js";
import { Product } from "../models/Product.js";
import { InventoryReturn } from "../models/Return.js";

const DASHBOARD_TIMEZONE = "Asia/Kolkata";
const TREND_WINDOW_DAYS = 14;
const ANALYSIS_WINDOW_DAYS = 30;
const TOP_PRODUCTS_LIMIT = 5;

const dateKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: DASHBOARD_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
});

const dateLabelFormatter = new Intl.DateTimeFormat("en-IN", {
  timeZone: DASHBOARD_TIMEZONE,
  day: "numeric",
  month: "short"
});

const startOfDay = (value = new Date()) => {
  const nextDate = new Date(value);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
};

const getDateDaysAgo = (days) => {
  const date = startOfDay();
  date.setDate(date.getDate() - days);
  return date;
};

const getRangeStarts = () => {
  const today = startOfDay();
  const week = getDateDaysAgo(6);
  const trend = getDateDaysAgo(TREND_WINDOW_DAYS - 1);
  const analysis = getDateDaysAgo(ANALYSIS_WINDOW_DAYS - 1);

  return { today, week, trend, analysis };
};

const getTotalQuantity = async (Model, match = {}) => {
  const [result] = await Model.aggregate([
    { $match: match },
    { $group: { _id: null, total: { $sum: "$quantity" } } }
  ]);

  return result?.total || 0;
};

const formatDateKey = (value) => dateKeyFormatter.format(new Date(value));

const formatDateLabel = (value) => dateLabelFormatter.format(new Date(value));

const getSeriesBuckets = (days) =>
  Array.from({ length: days }, (_, index) => {
    const date = getDateDaysAgo(days - index - 1);

    return {
      key: formatDateKey(date),
      date: date.toISOString(),
      label: formatDateLabel(date),
      dispatched: 0,
      returned: 0
    };
  });

const buildMovementTrend = ({ dispatches, returns, days = TREND_WINDOW_DAYS }) => {
  // Normalize sparse movement history into a complete day-by-day series for the chart UI.
  const series = getSeriesBuckets(days);
  const seriesByDate = new Map(series.map((item) => [item.key, item]));

  dispatches.forEach((record) => {
    const bucket = seriesByDate.get(formatDateKey(record.date));

    if (bucket) {
      bucket.dispatched += record.quantity;
    }
  });

  returns.forEach((record) => {
    const bucket = seriesByDate.get(formatDateKey(record.date));

    if (bucket) {
      bucket.returned += record.quantity;
    }
  });

  return series.map(({ key, ...item }) => item);
};

const getTopProductsAnalysis = async (companyId, analysisStart) => {
  const aggregated = await Dispatch.aggregate([
    { $match: { companyId, date: { $gte: analysisStart } } },
    {
      $group: {
        _id: {
          sku: "$sku",
          productName: "$productName"
        },
        quantity: { $sum: "$quantity" }
      }
    },
    { $sort: { quantity: -1, "_id.productName": 1 } }
  ]);

  const totalQuantity = aggregated.reduce((sum, item) => sum + item.quantity, 0);
  const topProducts = aggregated.slice(0, TOP_PRODUCTS_LIMIT);
  const otherQuantity = aggregated
    .slice(TOP_PRODUCTS_LIMIT)
    .reduce((sum, item) => sum + item.quantity, 0);

  const items = topProducts.map((item) => ({
    sku: item._id.sku,
    name: item._id.productName,
    quantity: item.quantity,
    share: totalQuantity ? Number(((item.quantity / totalQuantity) * 100).toFixed(1)) : 0
  }));

  if (otherQuantity > 0) {
    items.push({
      sku: "OTHERS",
      name: "Others",
      quantity: otherQuantity,
      share: totalQuantity ? Number(((otherQuantity / totalQuantity) * 100).toFixed(1)) : 0
    });
  }

  return {
    windowDays: ANALYSIS_WINDOW_DAYS,
    totalQuantity,
    items
  };
};

const getReturnBreakdownAnalysis = async (companyId, analysisStart) => {
  const aggregated = await InventoryReturn.aggregate([
    { $match: { companyId, date: { $gte: analysisStart } } },
    {
      $group: {
        _id: "$type",
        quantity: { $sum: "$quantity" }
      }
    }
  ]);

  const quantityByType = aggregated.reduce(
    (totals, item) => ({
      ...totals,
      [item._id]: item.quantity
    }),
    { return: 0, exchange: 0 }
  );

  const totalQuantity = quantityByType.return + quantityByType.exchange;

  return {
    windowDays: ANALYSIS_WINDOW_DAYS,
    totalQuantity,
    items: [
      {
        type: "return",
        label: "Returns",
        quantity: quantityByType.return,
        share: totalQuantity ? Number(((quantityByType.return / totalQuantity) * 100).toFixed(1)) : 0
      },
      {
        type: "exchange",
        label: "Exchanges",
        quantity: quantityByType.exchange,
        share: totalQuantity ? Number(((quantityByType.exchange / totalQuantity) * 100).toFixed(1)) : 0
      }
    ]
  };
};

export const getDashboardSummary = async (companyId) => {
  const { today, week, trend, analysis } = getRangeStarts();

  const [
    inventorySummary,
    lowStockItems,
    dispatchedAllTime,
    dispatchedToday,
    dispatchedLast7Days,
    returnsAllTime,
    returnsToday,
    returnsLast7Days,
    dispatchTrendRows,
    returnTrendRows,
    topProducts,
    returnBreakdown,
    recentActivity
  ] = await Promise.all([
    Product.aggregate([
      { $match: { companyId } },
      {
        $group: {
          _id: null,
          totalStock: { $sum: "$stock" },
          totalProducts: { $sum: 1 }
        }
      }
    ]),
    Product.find({
      companyId,
      $expr: { $lte: ["$stock", "$lowStockThreshold"] }
    })
      .sort({ stock: 1, name: 1 })
      .select("name sku stock lowStockThreshold")
      .lean(),
    getTotalQuantity(Dispatch, { companyId }),
    getTotalQuantity(Dispatch, { companyId, date: { $gte: today } }),
    getTotalQuantity(Dispatch, { companyId, date: { $gte: week } }),
    getTotalQuantity(InventoryReturn, { companyId }),
    getTotalQuantity(InventoryReturn, { companyId, date: { $gte: today } }),
    getTotalQuantity(InventoryReturn, { companyId, date: { $gte: week } }),
    Dispatch.find({ companyId, date: { $gte: trend } }).select("date quantity").lean(),
    InventoryReturn.find({ companyId, date: { $gte: trend } }).select("date quantity").lean(),
    getTopProductsAnalysis(companyId, analysis),
    getReturnBreakdownAnalysis(companyId, analysis),
    ActivityLog.find({ companyId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()
  ]);

  const summary = inventorySummary[0] || { totalStock: 0, totalProducts: 0 };
  const movementTrend = buildMovementTrend({
    dispatches: dispatchTrendRows,
    returns: returnTrendRows
  });
  const trendTotals = movementTrend.reduce(
    (totals, item) => ({
      dispatched: totals.dispatched + item.dispatched,
      returned: totals.returned + item.returned
    }),
    { dispatched: 0, returned: 0 }
  );

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
    analytics: {
      movementTrend: {
        windowDays: TREND_WINDOW_DAYS,
        totals: {
          dispatched: trendTotals.dispatched,
          returned: trendTotals.returned,
          net: trendTotals.dispatched - trendTotals.returned
        },
        items: movementTrend
      },
      topProducts,
      returnBreakdown
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
