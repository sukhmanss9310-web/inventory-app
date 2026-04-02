import { ActivityLog } from "../models/ActivityLog.js";

const normalizeDateRange = ({ startDate, endDate }) => {
  const createdAt = {};

  if (startDate) {
    const parsedStart = new Date(startDate);

    if (!Number.isNaN(parsedStart.getTime())) {
      createdAt.$gte = parsedStart;
    }
  }

  if (endDate) {
    const parsedEnd = new Date(endDate);

    if (!Number.isNaN(parsedEnd.getTime())) {
      parsedEnd.setHours(23, 59, 59, 999);
      createdAt.$lte = parsedEnd;
    }
  }

  return Object.keys(createdAt).length > 0 ? createdAt : null;
};

export const getActivityLogs = async ({
  page = 1,
  limit = 20,
  search = "",
  action,
  actorRole,
  movementType,
  startDate,
  endDate
}) => {
  const skip = (page - 1) * limit;
  const filters = {};
  const dateRange = normalizeDateRange({ startDate, endDate });

  if (action) {
    filters.action = action;
  }

  if (actorRole) {
    filters.actorRole = actorRole;
  }

  if (movementType) {
    filters.movementType = movementType;
  }

  if (dateRange) {
    filters.createdAt = dateRange;
  }

  if (search) {
    const pattern = new RegExp(search, "i");
    filters.$or = [
      { actorName: pattern },
      { productName: pattern },
      { message: pattern },
      { "metadata.sku": pattern }
    ];
  }

  const [items, total] = await Promise.all([
    ActivityLog.find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ActivityLog.countDocuments(filters)
  ]);

  return {
    logs: items.map((item) => ({
      id: item._id,
      actorName: item.actorName,
      actorRole: item.actorRole,
      action: item.action,
      movementType: item.movementType,
      message: item.message,
      productName: item.productName,
      quantity: item.quantity,
      sku: item.metadata?.sku || "",
      createdAt: item.createdAt
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit))
    },
    filters: {
      search,
      action: action || "",
      actorRole: actorRole || "",
      movementType: movementType || "",
      startDate: startDate || "",
      endDate: endDate || ""
    }
  };
};
