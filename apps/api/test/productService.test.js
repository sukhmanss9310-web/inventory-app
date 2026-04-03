import assert from "node:assert/strict";
import test from "node:test";
import { ActivityLog } from "../src/models/ActivityLog.js";
import { Product } from "../src/models/Product.js";
import { importProducts } from "../src/services/productService.js";

const user = {
  companyId: "507f1f77bcf86cd799439001",
  _id: "507f1f77bcf86cd799439012",
  name: "Operations Owner",
  role: "admin"
};

const company = {
  _id: "507f1f77bcf86cd799439001",
  name: "Atlas Retail",
  code: "atlas-retail"
};

test("importProducts creates and updates products from uploaded spreadsheet rows", async (t) => {
  let insertPayload;
  let bulkPayload;
  let activityPayload;

  t.mock.method(Product, "find", async () => [
    {
      _id: "507f1f77bcf86cd799439101",
      companyId: user.companyId,
      name: "Samsung 25W Charger",
      sku: "FLP-SM-25W",
      stock: 67,
      lowStockThreshold: 12
    }
  ]);
  t.mock.method(Product, "insertMany", async (payload) => {
    insertPayload = payload;
    return payload.map((row, index) => ({ _id: `created-${index}`, ...row }));
  });
  t.mock.method(Product, "bulkWrite", async (payload) => {
    bulkPayload = payload;
    return { modifiedCount: payload.length };
  });
  t.mock.method(ActivityLog, "create", async (payload) => {
    activityPayload = payload;
    return payload;
  });

  const result = await importProducts(
    {
      rows: [
        {
          "Product Name": "Boat Rockerz 450",
          SKU: "amz-bt-450",
          Stock: "42",
          Threshold: "10"
        },
        {
          name: "Samsung 25W Charger",
          sku: "FLP-SM-25W",
          stock: 70,
          lowStockThreshold: 12
        }
      ],
      sourceLabel: "inventory-april.xlsx"
    },
    user,
    company
  );

  assert.equal(insertPayload.length, 1);
  assert.deepEqual(insertPayload[0], {
    companyId: user.companyId,
    name: "Boat Rockerz 450",
    sku: "AMZ-BT-450",
    stock: 42,
    lowStockThreshold: 10,
    createdBy: user._id,
    updatedBy: user._id
  });
  assert.equal(bulkPayload.length, 1);
  assert.deepEqual(bulkPayload[0].updateOne.filter, {
    _id: "507f1f77bcf86cd799439101",
    companyId: user.companyId
  });
  assert.equal(activityPayload.action, "inventory_imported");
  assert.equal(activityPayload.metadata.sourceLabel, "inventory-april.xlsx");
  assert.deepEqual(result.summary, {
    totalRows: 2,
    createdCount: 1,
    updatedCount: 1,
    unchangedCount: 0,
    sourceType: "spreadsheet",
    sourceLabel: "inventory-april.xlsx"
  });
});

test("importProducts loads rows from a Google Sheet link", async (t) => {
  let fetchUrl;
  let insertPayload;

  t.mock.method(globalThis, "fetch", async (url) => {
    fetchUrl = url;
    return {
      ok: true,
      async text() {
        return "name,sku,stock,lowStockThreshold\nBoat Rockerz 450,AMZ-BT-450,42,10\n";
      }
    };
  });
  t.mock.method(Product, "find", async () => []);
  t.mock.method(Product, "insertMany", async (payload) => {
    insertPayload = payload;
    return payload.map((row, index) => ({ _id: `created-${index}`, ...row }));
  });
  t.mock.method(ActivityLog, "create", async (payload) => payload);

  const result = await importProducts(
    {
      sheetUrl: "https://docs.google.com/spreadsheets/d/sheet123/edit#gid=456"
    },
    user,
    company
  );

  assert.equal(
    fetchUrl,
    "https://docs.google.com/spreadsheets/d/sheet123/export?format=csv&gid=456"
  );
  assert.equal(insertPayload.length, 1);
  assert.equal(result.summary.sourceType, "google_sheet");
});

test("importProducts rejects duplicate SKUs inside the same spreadsheet", async () => {
  await assert.rejects(
    importProducts(
      {
        rows: [
          { name: "Item A", sku: "SKU-1", stock: 5, lowStockThreshold: 1 },
          { name: "Item B", sku: "SKU-1", stock: 8, lowStockThreshold: 2 }
        ]
      },
      user,
      company
    ),
    (error) => {
      assert.equal(error.statusCode, 400);
      assert.match(error.message, /Duplicate SKU/);
      return true;
    }
  );
});
