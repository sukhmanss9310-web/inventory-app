import assert from "node:assert/strict";
import test from "node:test";
import { ActivityLog } from "../src/models/ActivityLog.js";
import { Dispatch } from "../src/models/Dispatch.js";
import { Product } from "../src/models/Product.js";
import { InventoryReturn } from "../src/models/Return.js";
import { addReturn, createDispatch } from "../src/services/inventoryService.js";

const user = {
  _id: "507f1f77bcf86cd799439012",
  name: "Warehouse Staff",
  role: "staff"
};

const buildProduct = (overrides = {}) => ({
  _id: "507f1f77bcf86cd799439013",
  name: "Boat Rockerz 450",
  sku: "AMZ-BT-450",
  stock: 12,
  lowStockThreshold: 5,
  createdAt: new Date("2026-04-02T10:00:00.000Z"),
  updatedAt: new Date("2026-04-02T10:05:00.000Z"),
  ...overrides
});

test("createDispatch stores the dispatch and returns the updated stock", async (t) => {
  const updatedProduct = buildProduct({ stock: 9 });
  let dispatchPayload;
  let activityPayload;

  t.mock.method(Product, "findOneAndUpdate", async () => updatedProduct);
  t.mock.method(Dispatch, "create", async (payload) => {
    dispatchPayload = payload;
    return {
      _id: "507f1f77bcf86cd799439014",
      date: new Date("2026-04-02T10:10:00.000Z"),
      ...payload
    };
  });
  t.mock.method(ActivityLog, "create", async (payload) => {
    activityPayload = payload;
    return payload;
  });

  const result = await createDispatch(
    {
      productId: updatedProduct._id,
      quantity: 3,
      note: "Order packed"
    },
    user
  );

  assert.equal(dispatchPayload.quantity, 3);
  assert.equal(activityPayload.action, "dispatch_created");
  assert.equal(result.product.stock, 9);
  assert.equal(result.dispatch.staffName, "Warehouse Staff");
});

test("createDispatch rejects insufficient stock", async (t) => {
  t.mock.method(Product, "findOneAndUpdate", async () => null);
  t.mock.method(Product, "findById", async () => buildProduct({ stock: 2 }));

  await assert.rejects(
    createDispatch(
      {
        productId: "507f1f77bcf86cd799439013",
        quantity: 5
      },
      user
    ),
    (error) => {
      assert.equal(error.statusCode, 400);
      assert.match(error.message, /Insufficient stock/);
      return true;
    }
  );
});

test("createDispatch rolls stock back if record creation fails", async (t) => {
  let rollbackArgs;

  t.mock.method(Product, "findOneAndUpdate", async () => buildProduct({ stock: 7 }));
  t.mock.method(Dispatch, "create", async () => {
    throw new Error("dispatch persistence failed");
  });
  t.mock.method(Product, "findByIdAndUpdate", async (...args) => {
    rollbackArgs = args;
    return null;
  });

  await assert.rejects(
    createDispatch(
      {
        productId: "507f1f77bcf86cd799439013",
        quantity: 5
      },
      user
    ),
    /dispatch persistence failed/
  );

  assert.deepEqual(rollbackArgs[0], "507f1f77bcf86cd799439013");
  assert.deepEqual(rollbackArgs[1], { $inc: { stock: 5 } });
});

test("addReturn stores the return and increases stock", async (t) => {
  const updatedProduct = buildProduct({ stock: 15 });
  let returnPayload;
  let activityPayload;

  t.mock.method(Product, "findByIdAndUpdate", async () => updatedProduct);
  t.mock.method(InventoryReturn, "create", async (payload) => {
    returnPayload = payload;
    return {
      _id: "507f1f77bcf86cd799439015",
      date: new Date("2026-04-02T10:12:00.000Z"),
      ...payload
    };
  });
  t.mock.method(ActivityLog, "create", async (payload) => {
    activityPayload = payload;
    return payload;
  });

  const result = await addReturn(
    {
      productId: updatedProduct._id,
      quantity: 3,
      type: "exchange",
      note: "Replacement processed"
    },
    user
  );

  assert.equal(returnPayload.type, "exchange");
  assert.equal(activityPayload.movementType, "exchange");
  assert.equal(result.product.stock, 15);
  assert.equal(result.returnEntry.quantity, 3);
});
