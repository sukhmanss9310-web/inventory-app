import { ActivityLog } from "../models/ActivityLog.js";
import { Product } from "../models/Product.js";
import { env } from "../config/env.js";
import { createError } from "../utils/errors.js";
import { getDashboardSummary } from "./dashboardService.js";
import { addReturn, createDispatch, resetInventoryStock } from "./inventoryService.js";
import { createProduct } from "./productService.js";

const ACTION_TYPES = new Set(["create_dispatch", "add_return", "reset_stock", "create_product"]);
const PRODUCT_CONTEXT_LIMIT = 180;
const RECENT_LOG_LIMIT = 20;

const compactProduct = (product) => ({
  id: String(product._id),
  name: product.name,
  sku: product.sku,
  stock: product.stock,
  lowStockThreshold: product.lowStockThreshold,
  isLowStock: product.stock <= product.lowStockThreshold
});

const compactLog = (log) => ({
  action: log.action,
  actorName: log.actorName,
  actorRole: log.actorRole,
  productName: log.productName,
  quantity: log.quantity,
  movementType: log.movementType,
  message: log.message,
  createdAt: log.createdAt
});

const AI_UNAVAILABLE_MESSAGE = "AI temporarily unavailable";
const AI_LOADING_MESSAGE = "AI model is loading. Please try again in a minute.";

const extractText = (payload) => {
  if (Array.isArray(payload)) {
    return payload[0]?.generated_text || "";
  }

  if (typeof payload?.generated_text === "string") {
    return payload.generated_text;
  }

  if (typeof payload?.error === "string") {
    return payload.error;
  }

  return "No response";
};

const parseJsonResponse = (rawText) => {
  const trimmedText = String(rawText || "").trim();

  try {
    return JSON.parse(trimmedText);
  } catch {
    const jsonMatch = trimmedText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        // Fall through to plain text response.
      }
    }

    return {
      reply:
        trimmedText ||
        "I could not read the AI response clearly. Please try the question again.",
      pendingAction: null
    };
  }
};

const buildAssistantContext = async (companyId) => {
  const [dashboard, products, recentLogs] = await Promise.all([
    getDashboardSummary(companyId),
    Product.find({ companyId })
      .sort({ stock: 1, name: 1 })
      .limit(PRODUCT_CONTEXT_LIMIT)
      .select("name sku stock lowStockThreshold")
      .lean(),
    ActivityLog.find({ companyId })
      .sort({ createdAt: -1 })
      .limit(RECENT_LOG_LIMIT)
      .select("action actorName actorRole productName quantity movementType message createdAt")
      .lean()
  ]);

  return {
    metrics: dashboard.metrics,
    analytics: dashboard.analytics,
    lowStockItems: dashboard.lowStockItems,
    products: products.map(compactProduct),
    recentActivity: recentLogs.map(compactLog),
    productContextLimit: PRODUCT_CONTEXT_LIMIT
  };
};

const buildSystemPrompt = ({ user, company, context }) => `You are the internal inventory AI assistant for ${company.name}.
Use only the JSON company data provided below. Keep replies short, operational, and practical.

Rules:
- Answer inventory, stock, dispatch, returns, low-stock, and sales-analysis questions from the provided data.
- If data is missing or not in context, say what is missing instead of guessing.
- You may propose admin inventory changes, but you must never claim that you executed them.
- For any inventory-changing request, return a pendingAction and explain what will happen after admin confirmation.
- Do not propose company-wide reset, deleting products, suspending users, or platform owner actions.
- If an action request is missing product, SKU, quantity, stock, or reason, ask a clear follow-up and do not return an action.

Allowed pendingAction types:
- create_dispatch: requires productSku or productName, quantity, optional note.
- add_return: requires productSku or productName, quantity, returnType of "return" or "exchange", optional note.
- reset_stock: requires productSku or productName, stock, reason.
- create_product: requires name, sku, stock, lowStockThreshold.

Return only valid JSON in this shape:
{
  "reply": "short answer for the admin",
  "pendingAction": null or {
    "type": "create_dispatch|add_return|reset_stock|create_product",
    "productSku": "SKU if relevant",
    "productName": "product name if relevant",
    "quantity": 1,
    "returnType": "return|exchange",
    "stock": 0,
    "reason": "reason if relevant",
    "note": "optional note",
    "name": "new product name if relevant",
    "sku": "new product sku if relevant",
    "lowStockThreshold": 5
  }
}

Current user:
${JSON.stringify({ name: user.name, role: user.role, companyCode: company.code })}

Company inventory context:
${JSON.stringify(context)}`;

const callHuggingFace = async ({ user, company, messages, context }) => {
  if (!env.huggingFaceApiKey) {
    return {
      reply: AI_UNAVAILABLE_MESSAGE,
      pendingAction: null
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.huggingFaceTimeoutMs);
  const prompt = [
    buildSystemPrompt({ user, company, context }),
    "",
    "Conversation:",
    ...messages.map((message) => `${message.role.toUpperCase()}: ${message.content}`)
  ].join("\n");

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/google/flan-t5-base",
      {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${env.huggingFaceApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 200,
            temperature: 0.7,
            return_full_text: false
          }
        })
      }
    );

    const data = await response.json().catch(() => ({}));
    console.log(data);

    if (typeof data?.error === "string" && /loading/i.test(data.error)) {
      return {
        reply: AI_LOADING_MESSAGE,
        pendingAction: null
      };
    }

    if (!response.ok) {
      return {
        reply: AI_UNAVAILABLE_MESSAGE,
        pendingAction: null
      };
    }

    return parseJsonResponse(extractText(data));
  } catch {
    return {
      reply: AI_UNAVAILABLE_MESSAGE,
      pendingAction: null
    };
  } finally {
    clearTimeout(timeout);
  }
};

const findProductForAction = async (action, companyId) => {
  if (action.productSku) {
    const product = await Product.findOne({
      companyId,
      sku: String(action.productSku).trim().toUpperCase()
    }).lean();

    if (product) {
      return product;
    }
  }

  if (action.productName) {
    const escapedName = String(action.productName).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const products = await Product.find({
      companyId,
      name: new RegExp(`^${escapedName}$`, "i")
    })
      .limit(2)
      .lean();

    if (products.length === 1) {
      return products[0];
    }

    if (products.length > 1) {
      throw createError("Multiple products matched that name. Please use SKU instead.", 400);
    }
  }

  throw createError("I could not find that product. Please use the exact SKU.", 404);
};

const normalizeQuantity = (value, fieldName = "quantity") => {
  const numberValue = Number(value);

  if (!Number.isInteger(numberValue) || numberValue <= 0) {
    throw createError(`A valid ${fieldName} is required for this action.`, 400);
  }

  return numberValue;
};

const normalizeStock = (value) => {
  const numberValue = Number(value);

  if (!Number.isInteger(numberValue) || numberValue < 0) {
    throw createError("A valid stock value is required for this action.", 400);
  }

  return numberValue;
};

const normalizeText = (value, fieldName, { min = 1, max = 200 } = {}) => {
  const text = String(value || "").trim();

  if (text.length < min) {
    throw createError(`${fieldName} is required for this action.`, 400);
  }

  return text.slice(0, max);
};

const normalizeProductId = (value) => {
  const productId = String(value || "").trim();

  if (!/^[0-9a-fA-F]{24}$/.test(productId)) {
    throw createError("A valid product id is required for this action.", 400);
  }

  return productId;
};

const preparePendingAction = async (rawAction, user) => {
  if (!rawAction) {
    return null;
  }

  if (!ACTION_TYPES.has(rawAction.type)) {
    throw createError("The AI suggested an unsupported action.", 400);
  }

  if (rawAction.type === "create_product") {
    const payload = {
      name: normalizeText(rawAction.name, "Product name", { max: 120 }),
      sku: normalizeText(rawAction.sku, "SKU", { max: 60 }).toUpperCase(),
      stock: normalizeStock(rawAction.stock),
      lowStockThreshold: normalizeStock(rawAction.lowStockThreshold)
    };

    const existingProduct = await Product.findOne({
      companyId: user.companyId,
      sku: payload.sku
    }).lean();

    if (existingProduct) {
      throw createError(`SKU ${payload.sku} already exists. Ask me to reset or update stock instead.`, 400);
    }

    return {
      type: "create_product",
      summary: `Create ${payload.name} (${payload.sku}) with stock ${payload.stock}.`,
      payload
    };
  }

  const product = await findProductForAction(rawAction, user.companyId);

  if (rawAction.type === "create_dispatch") {
    const quantity = normalizeQuantity(rawAction.quantity);

    if (product.stock < quantity) {
      throw createError(`Cannot dispatch ${quantity}. ${product.name} only has ${product.stock} in stock.`, 400);
    }

    return {
      type: "create_dispatch",
      summary: `Dispatch ${quantity} unit${quantity === 1 ? "" : "s"} of ${product.name}. Stock will become ${
        product.stock - quantity
      }.`,
      payload: {
        productId: String(product._id),
        quantity,
        note: normalizeText(rawAction.note || "AI assistant dispatch", "Note", { max: 200 })
      }
    };
  }

  if (rawAction.type === "add_return") {
    const quantity = normalizeQuantity(rawAction.quantity);
    const returnType = rawAction.returnType === "exchange" ? "exchange" : "return";

    return {
      type: "add_return",
      summary: `Add ${quantity} ${returnType}${quantity === 1 ? "" : "s"} for ${product.name}. Stock will become ${
        product.stock + quantity
      }.`,
      payload: {
        productId: String(product._id),
        quantity,
        type: returnType,
        note: normalizeText(rawAction.note || "AI assistant return", "Note", { max: 200 })
      }
    };
  }

  const nextStock = normalizeStock(rawAction.stock);
  const reason = normalizeText(rawAction.reason, "Reason", { min: 3, max: 200 });

  return {
    type: "reset_stock",
    summary: `Reset ${product.name} stock from ${product.stock} to ${nextStock}.`,
    payload: {
      productId: String(product._id),
      stock: nextStock,
      reason: `AI assistant: ${reason}`
    }
  };
};

export const chatWithAssistant = async ({ messages }, user, company) => {
  const context = await buildAssistantContext(user.companyId);
  const aiResponse = await callHuggingFace({ user, company, messages, context });
  let pendingAction = null;
  let reply = normalizeText(aiResponse.reply, "Assistant reply", { max: 1200 });

  if (aiResponse.pendingAction) {
    try {
      pendingAction = await preparePendingAction(aiResponse.pendingAction, user);
    } catch (error) {
      reply = `${reply}\n\n${error.message}`;
      pendingAction = null;
    }
  }

  return {
    reply,
    pendingAction,
    contextMeta: {
      productsAnalyzed: context.products.length,
      productContextLimit: context.productContextLimit,
      recentLogsAnalyzed: context.recentActivity.length
    }
  };
};

export const executeAssistantAction = async ({ action }, user) => {
  if (!action || !ACTION_TYPES.has(action.type)) {
    throw createError("Unsupported assistant action", 400);
  }

  if (action.type === "create_dispatch") {
    const result = await createDispatch(
      {
        productId: normalizeProductId(action.payload.productId),
        quantity: normalizeQuantity(action.payload.quantity),
        note: normalizeText(action.payload.note || "AI assistant dispatch", "Note", { max: 200 })
      },
      user
    );

    return {
      message: `Dispatched ${result.dispatch.quantity} unit${result.dispatch.quantity === 1 ? "" : "s"} of ${
        result.dispatch.productName
      }.`,
      result
    };
  }

  if (action.type === "add_return") {
    const result = await addReturn(
      {
        productId: normalizeProductId(action.payload.productId),
        quantity: normalizeQuantity(action.payload.quantity),
        type: action.payload.type === "exchange" ? "exchange" : "return",
        note: normalizeText(action.payload.note || "AI assistant return", "Note", { max: 200 })
      },
      user
    );

    return {
      message: `Added ${result.returnEntry.quantity} ${result.returnEntry.type}${
        result.returnEntry.quantity === 1 ? "" : "s"
      } for ${result.returnEntry.productName}.`,
      result
    };
  }

  if (action.type === "reset_stock") {
    const result = await resetInventoryStock(
      {
        productId: normalizeProductId(action.payload.productId),
        stock: normalizeStock(action.payload.stock),
        reason: normalizeText(action.payload.reason, "Reason", { min: 3, max: 200 })
      },
      user
    );

    return {
      message: `Reset ${result.product.name} stock to ${result.product.stock}.`,
      result
    };
  }

  const result = await createProduct(
    {
      name: normalizeText(action.payload.name, "Product name", { max: 120 }),
      sku: normalizeText(action.payload.sku, "SKU", { max: 60 }).toUpperCase(),
      stock: normalizeStock(action.payload.stock),
      lowStockThreshold: normalizeStock(action.payload.lowStockThreshold)
    },
    user
  );

  return {
    message: `Created ${result.name} (${result.sku}) with stock ${result.stock}.`,
    result
  };
};
