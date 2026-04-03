import assert from "node:assert/strict";
import test from "node:test";
import mongoose from "mongoose";
import { ActivityLog } from "../src/models/ActivityLog.js";
import { Dispatch } from "../src/models/Dispatch.js";
import { Product } from "../src/models/Product.js";
import { InventoryReturn } from "../src/models/Return.js";
import {
  addReturn,
  createDispatch,
  resetCompanyInventory,
  resetInventoryStock
} from "../src/services/inventoryService.js";

const user = {
  companyId: "507f1f77bcf86cd799439001",
  _id: "507f1f77bcf86cd799439012",
  name: "Warehouse Staff",
  role: "staff"
};

const company = {
  _id: "507f1f77bcf86cd799439001",
  name: "Atlas Retail",
  code: "atlas-retail"
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
  let updateArgs;
  let dispatchPayload;
  let activityPayload;

  t.mock.method(Product, "findOneAndUpdate", async (...args) => {
    updateArgs = args;
    return updatedProduct;
  });
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

  assert.deepEqual(updateArgs[0], {
    _id: updatedProduct._id,
    companyId: user.companyId,
    stock: { $gte: 3 }
  });
  assert.equal(dispatchPayload.companyId, user.companyId);
  assert.equal(dispatchPayload.quantity, 3);
  assert.equal(activityPayload.companyId, user.companyId);
  assert.equal(activityPayload.action, "dispatch_created");
  assert.equal(result.product.stock, 9);
  assert.equal(result.dispatch.staffName, "Warehouse Staff");
});

test("createDispatch rejects insufficient stock", async (t) => {
  t.mock.method(Product, "findOneAndUpdate", async () => null);
  t.mock.method(Product, "findOne", async () => buildProduct({ stock: 2 }));

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
  let callCount = 0;
  let rollbackArgs;

  t.mock.method(Product, "findOneAndUpdate", async (...args) => {
    callCount += 1;

    if (callCount === 1) {
      return buildProduct({ stock: 7 });
    }

    rollbackArgs = args;
    return null;
  });
  t.mock.method(Dispatch, "create", async () => {
    throw new Error("dispatch persistence failed");
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

  assert.deepEqual(rollbackArgs[0], {
    _id: "507f1f77bcf86cd799439013",
    companyId: user.companyId
  });
  assert.deepEqual(rollbackArgs[1], { $inc: { stock: 5 } });
});

test("addReturn stores the return and increases stock", async (t) => {
  const updatedProduct = buildProduct({ stock: 15 });
  let updateArgs;
  let returnPayload;
  let activityPayload;

  t.mock.method(Product, "findOneAndUpdate", async (...args) => {
    updateArgs = args;
    return updatedProduct;
  });
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

  assert.deepEqual(updateArgs[0], {
    _id: updatedProduct._id,
    companyId: user.companyId
  });
  assert.equal(returnPayload.companyId, user.companyId);
  assert.equal(activityPayload.companyId, user.companyId);
  assert.equal(returnPayload.type, "exchange");
  assert.equal(activityPayload.movementType, "exchange");
  assert.equal(result.product.stock, 15);
  assert.equal(result.returnEntry.quantity, 3);
});

test("resetInventoryStock lets an admin set the exact stock with an audit reason", async (t) => {
  let saved = false;
  let activityPayload;

  const product = {
    ...buildProduct({ stock: 12, updatedBy: null }),
    save: async function save() {
      saved = true;
      return this;
    }
  };

  t.mock.method(Product, "findOne", async (filters) => {
    assert.deepEqual(filters, {
      _id: product._id,
      companyId: user.companyId
    });
    return product;
  });
  t.mock.method(ActivityLog, "create", async (payload) => {
    activityPayload = payload;
    return payload;
  });

  const result = await resetInventoryStock(
    {
      productId: product._id,
      stock: 20,
      reason: "Cycle count correction"
    },
    user
  );

  assert.equal(saved, true);
  assert.equal(product.stock, 20);
  assert.equal(product.updatedBy, user._id);
  assert.equal(activityPayload.action, "inventory_adjusted");
  assert.equal(activityPayload.companyId, user.companyId);
  assert.equal(activityPayload.metadata.reason, "Cycle count correction");
  assert.equal(result.product.stock, 20);
});

test("resetCompanyInventory clears company operations and zeroes product stock", async (t) => {
  let started = false;
  let ended = false;
  let withTransactionCalled = false;
  let updateManyArgs;
  let dispatchDeleteArgs;
  let returnDeleteArgs;
  let logDeleteArgs;
  let createdLogPayload;
  let createdLogOptions;

  t.mock.method(mongoose, "startSession", async () => ({
    async withTransaction(callback) {
      withTransactionCalled = true;
      await callback();
    },
    async endSession() {
      ended = true;
    }
  }));
  started = true;

  t.mock.method(Product, "find", async (filters, projection, options) => {
    assert.deepEqual(filters, { companyId: user.companyId });
    assert.equal(projection, null);
    assert.ok(options.session);
    return [buildProduct({ stock: 12 }), buildProduct({ _id: "507f1f77bcf86cd799439099", stock: 8 })];
  });
  t.mock.method(Product, "updateMany", async (...args) => {
    updateManyArgs = args;
    return { modifiedCount: 2 };
  });
  t.mock.method(Dispatch, "deleteMany", async (...args) => {
    dispatchDeleteArgs = args;
    return { deletedCount: 4 };
  });
  t.mock.method(InventoryReturn, "deleteMany", async (...args) => {
    returnDeleteArgs = args;
    return { deletedCount: 2 };
  });
  t.mock.method(ActivityLog, "deleteMany", async (...args) => {
    logDeleteArgs = args;
    return { deletedCount: 7 };
  });
  t.mock.method(ActivityLog, "create", async (...args) => {
    [createdLogPayload, createdLogOptions] = args;
    return createdLogPayload;
  });

  const result = await resetCompanyInventory(
    {
      confirmation: "atlas-retail",
      reason: "Monthly reset after audit"
    },
    user,
    company
  );

  assert.equal(started, true);
  assert.equal(withTransactionCalled, true);
  assert.equal(ended, true);
  assert.deepEqual(updateManyArgs[0], { companyId: user.companyId });
  assert.deepEqual(updateManyArgs[1], {
    $set: {
      stock: 0,
      updatedBy: user._id
    }
  });
  assert.deepEqual(dispatchDeleteArgs[0], { companyId: user.companyId });
  assert.deepEqual(returnDeleteArgs[0], { companyId: user.companyId });
  assert.deepEqual(logDeleteArgs[0], { companyId: user.companyId });
  assert.equal(createdLogPayload[0].action, "company_reset");
  assert.equal(createdLogPayload[0].entityType, "company");
  assert.equal(createdLogPayload[0].metadata.previousTotalStock, 20);
  assert.ok(createdLogOptions.session);
  assert.deepEqual(result.summary, {
    productsReset: 2,
    previousTotalStock: 20,
    dispatchesCleared: 4,
    returnsCleared: 2,
    logsCleared: 7
  });
});

test("resetCompanyInventory rejects resets without the exact company code", async () => {
  await assert.rejects(
    resetCompanyInventory(
      {
        confirmation: "wrong-company",
        reason: "Bad input"
      },
      user,
      company
    ),
    (error) => {
      assert.equal(error.statusCode, 400);
      assert.match(error.message, /exact company code/i);
      return true;
    }
  );
});
