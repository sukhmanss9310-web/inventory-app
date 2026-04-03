import assert from "node:assert/strict";
import test from "node:test";
import { ActivityLog } from "../src/models/ActivityLog.js";
import { Dispatch } from "../src/models/Dispatch.js";
import { Product } from "../src/models/Product.js";
import { InventoryReturn } from "../src/models/Return.js";
import { getDashboardSummary } from "../src/services/dashboardService.js";

const createQueryChain = (rows) => ({
  sort() {
    return this;
  },
  select() {
    return this;
  },
  limit() {
    return this;
  },
  lean: async () => rows
});

test("getDashboardSummary returns chart-ready analytics for the admin dashboard", async (t) => {
  const companyId = "507f1f77bcf86cd799439001";
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  const threeDaysAgo = new Date(today);
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  let dispatchAggregateCall = 0;
  let returnAggregateCall = 0;

  t.mock.method(Product, "aggregate", async () => [
    {
      totalStock: 120,
      totalProducts: 3
    }
  ]);
  t.mock.method(Product, "find", () =>
    createQueryChain([
      {
        _id: "507f1f77bcf86cd799439101",
        name: "Boat Rockerz 450",
        sku: "AMZ-BT-450",
        stock: 4,
        lowStockThreshold: 6
      }
    ])
  );
  t.mock.method(Dispatch, "aggregate", async () => {
    dispatchAggregateCall += 1;

    if (dispatchAggregateCall === 1) {
      return [{ total: 60 }];
    }

    if (dispatchAggregateCall === 2) {
      return [{ total: 7 }];
    }

    if (dispatchAggregateCall === 3) {
      return [{ total: 22 }];
    }

    return [
      {
        _id: { sku: "AMZ-BT-450", productName: "Boat Rockerz 450" },
        quantity: 30
      },
      {
        _id: { sku: "FLP-SM-25W", productName: "Samsung 25W Charger" },
        quantity: 18
      },
      {
        _id: { sku: "AMZ-NKB-1", productName: "Noise Buds VS104" },
        quantity: 12
      }
    ];
  });
  t.mock.method(Dispatch, "find", () =>
    createQueryChain([
      { date: today, quantity: 7 },
      { date: threeDaysAgo, quantity: 5 }
    ])
  );
  t.mock.method(InventoryReturn, "aggregate", async () => {
    returnAggregateCall += 1;

    if (returnAggregateCall === 1) {
      return [{ total: 12 }];
    }

    if (returnAggregateCall === 2) {
      return [{ total: 2 }];
    }

    if (returnAggregateCall === 3) {
      return [{ total: 5 }];
    }

    return [
      { _id: "return", quantity: 9 },
      { _id: "exchange", quantity: 3 }
    ];
  });
  t.mock.method(InventoryReturn, "find", () =>
    createQueryChain([
      { date: today, quantity: 2 },
      { date: threeDaysAgo, quantity: 1 }
    ])
  );
  t.mock.method(ActivityLog, "find", () =>
    createQueryChain([
      {
        _id: "507f1f77bcf86cd799439401",
        actorName: "Sukhman",
        actorRole: "admin",
        message: "Dispatched 7 units of Boat Rockerz 450",
        createdAt: today
      }
    ])
  );

  const dashboard = await getDashboardSummary(companyId);

  assert.equal(dashboard.metrics.totalStock, 120);
  assert.equal(dashboard.metrics.dispatchedAllTime, 60);
  assert.equal(dashboard.metrics.returnsAllTime, 12);
  assert.equal(dashboard.analytics.movementTrend.windowDays, 14);
  assert.equal(dashboard.analytics.movementTrend.totals.dispatched, 12);
  assert.equal(dashboard.analytics.movementTrend.totals.returned, 3);
  assert.equal(dashboard.analytics.topProducts.totalQuantity, 60);
  assert.deepEqual(dashboard.analytics.returnBreakdown.items, [
    { type: "return", label: "Returns", quantity: 9, share: 75 },
    { type: "exchange", label: "Exchanges", quantity: 3, share: 25 }
  ]);
  assert.equal(dashboard.analytics.movementTrend.items.length, 14);
  assert.ok(
    dashboard.analytics.movementTrend.items.some(
      (item) => item.dispatched === 7 && item.returned === 2
    )
  );
  assert.ok(
    dashboard.analytics.movementTrend.items.some(
      (item) => item.dispatched === 5 && item.returned === 1
    )
  );
  assert.deepEqual(dashboard.analytics.topProducts.items.map((item) => item.name), [
    "Boat Rockerz 450",
    "Samsung 25W Charger",
    "Noise Buds VS104"
  ]);
});
