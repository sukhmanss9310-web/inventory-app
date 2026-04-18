import assert from "node:assert/strict";
import test from "node:test";

process.env.GEMINI_API_KEY = "test-gemini-key";

const { chatWithAssistant, executeAssistantAction } = await import(
  "../src/services/assistantService.js"
);
const { ActivityLog } = await import("../src/models/ActivityLog.js");
const { Dispatch } = await import("../src/models/Dispatch.js");
const { Product } = await import("../src/models/Product.js");
const { InventoryReturn } = await import("../src/models/Return.js");

const companyId = "507f1f77bcf86cd799439001";
const user = {
  companyId,
  _id: "507f1f77bcf86cd799439012",
  name: "Owner",
  role: "admin"
};
const company = {
  _id: companyId,
  name: "Atlas Retail",
  code: "atlas-retail"
};
const product = {
  _id: "507f1f77bcf86cd799439013",
  name: "Boat Rockerz 450",
  sku: "AMZ-BT-450",
  stock: 12,
  lowStockThreshold: 5
};

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

test("chatWithAssistant answers from inventory data and prepares a safe pending action", async (t) => {
  let geminiPayload;
  let geminiUrl;
  const originalFetch = globalThis.fetch;

  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  globalThis.fetch = async (url, options) => {
    geminiUrl = url;
    geminiPayload = JSON.parse(options.body);

    return {
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    reply: "I can prepare that dispatch for confirmation.",
                    pendingAction: {
                      type: "create_dispatch",
                      productSku: "AMZ-BT-450",
                      quantity: 2,
                      note: "AI suggested dispatch"
                    }
                  })
                }
              ]
            }
          }
        ]
      })
    };
  };

  t.mock.method(Product, "aggregate", async () => [{ totalStock: 12, totalProducts: 1 }]);
  t.mock.method(Product, "find", (filters) => {
    if (filters.$expr) {
      return createQueryChain([product]);
    }

    return createQueryChain([product]);
  });
  t.mock.method(Product, "findOne", (filters) => {
    assert.equal(filters.companyId, companyId);
    assert.equal(filters.sku, "AMZ-BT-450");
    return {
      lean: async () => product
    };
  });
  let dispatchAggregateCall = 0;
  let returnAggregateCall = 0;

  t.mock.method(Dispatch, "aggregate", async () => {
    dispatchAggregateCall += 1;
    return dispatchAggregateCall < 4
      ? [{ total: 0 }]
      : [{ _id: { sku: product.sku, productName: product.name }, quantity: 4 }];
  });
  t.mock.method(Dispatch, "find", () => createQueryChain([]));
  t.mock.method(InventoryReturn, "aggregate", async () => {
    returnAggregateCall += 1;
    return returnAggregateCall < 4 ? [{ total: 0 }] : [];
  });
  t.mock.method(InventoryReturn, "find", () => createQueryChain([]));
  t.mock.method(ActivityLog, "find", () => createQueryChain([]));

  const response = await chatWithAssistant(
    {
      messages: [{ role: "user", content: "Dispatch 2 units of AMZ-BT-450" }]
    },
    user,
    company
  );

  assert.match(geminiUrl, /generativelanguage\.googleapis\.com\/v1\/models\/gemini-pro:generateContent/);
  assert.equal(geminiPayload.generationConfig.temperature, 0.2);
  assert.equal(geminiPayload.contents[0].role, "user");
  assert.equal(response.reply, "I can prepare that dispatch for confirmation.");
  assert.equal(response.pendingAction.type, "create_dispatch");
  assert.equal(response.pendingAction.payload.productId, product._id);
  assert.equal(response.pendingAction.payload.quantity, 2);
  assert.match(response.pendingAction.summary, /Stock will become 10/);
});

test("executeAssistantAction revalidates action payloads before inventory changes", async () => {
  await assert.rejects(
    executeAssistantAction(
      {
        action: {
          type: "create_dispatch",
          summary: "Bad dispatch",
          payload: {
            productId: "not-a-product-id",
            quantity: 2
          }
        }
      },
      user
    ),
    (error) => {
      assert.equal(error.statusCode, 400);
      assert.match(error.message, /valid product id/i);
      return true;
    }
  );
});
