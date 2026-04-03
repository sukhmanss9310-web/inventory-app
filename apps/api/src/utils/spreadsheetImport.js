import { createError } from "./errors.js";

const headerAliases = {
  name: ["name", "productname", "product", "itemname", "title"],
  sku: ["sku", "productsku", "itemsku", "skucode", "seller sku", "seller_sku"],
  stock: [
    "stock",
    "openingstock",
    "currentstock",
    "quantity",
    "qty",
    "inventory",
    "availablequantity"
  ],
  lowStockThreshold: [
    "lowstockthreshold",
    "lowstock",
    "threshold",
    "reorderlevel",
    "reorderpoint",
    "lowstocklimit"
  ]
};

const normalizeHeader = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

const extractField = (row, aliases) => {
  const entries = Object.entries(row || {});

  for (const [key, value] of entries) {
    if (aliases.includes(normalizeHeader(key))) {
      return value;
    }
  }

  return "";
};

const parseInteger = (value, field, rowNumber, { defaultValue } = {}) => {
  if (value === undefined || value === null || String(value).trim() === "") {
    if (defaultValue !== undefined) {
      return defaultValue;
    }

    throw createError(`Row ${rowNumber}: ${field} is required`, 400);
  }

  const parsedValue = Number(String(value).trim());

  if (!Number.isInteger(parsedValue) || parsedValue < 0) {
    throw createError(`Row ${rowNumber}: ${field} must be a non-negative whole number`, 400);
  }

  return parsedValue;
};

export const normalizeImportRows = (rows = []) => {
  if (!Array.isArray(rows) || rows.length === 0) {
    throw createError("No rows were found to import", 400);
  }

  const normalizedRows = rows
    .map((row, index) => {
      const rowNumber = index + 2;
      const name = String(extractField(row, headerAliases.name) || "").trim();
      const sku = String(extractField(row, headerAliases.sku) || "")
        .trim()
        .toUpperCase();

      if (!name) {
        throw createError(`Row ${rowNumber}: product name is required`, 400);
      }

      if (!sku) {
        throw createError(`Row ${rowNumber}: SKU is required`, 400);
      }

      return {
        name,
        sku,
        stock: parseInteger(extractField(row, headerAliases.stock), "stock", rowNumber),
        lowStockThreshold: parseInteger(
          extractField(row, headerAliases.lowStockThreshold),
          "low stock threshold",
          rowNumber,
          { defaultValue: 5 }
        )
      };
    })
    .filter(Boolean);

  const seenSkus = new Set();

  normalizedRows.forEach((row) => {
    if (seenSkus.has(row.sku)) {
      throw createError(`Duplicate SKU found in import file: ${row.sku}`, 400);
    }

    seenSkus.add(row.sku);
  });

  return normalizedRows;
};

const parseCsvRows = (csvText) => {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < csvText.length; index += 1) {
    const character = csvText[index];
    const nextCharacter = csvText[index + 1];

    if (character === "\"") {
      if (inQuotes && nextCharacter === "\"") {
        cell += "\"";
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (character === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((character === "\n" || character === "\r") && !inQuotes) {
      if (character === "\r" && nextCharacter === "\n") {
        index += 1;
      }

      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += character;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows.filter((currentRow) => currentRow.some((value) => String(value).trim() !== ""));
};

const rowsToObjects = (rows) => {
  const [headers = [], ...records] = rows;

  return records.map((record) =>
    headers.reduce((current, header, index) => {
      current[header] = record[index] ?? "";
      return current;
    }, {})
  );
};

export const extractGoogleSheetCsvUrl = (sheetUrl) => {
  const url = new URL(sheetUrl);

  if (!url.hostname.includes("docs.google.com")) {
    throw createError("Please provide a valid Google Sheet URL", 400);
  }

  if (url.searchParams.get("format") === "csv") {
    return url.toString();
  }

  const match = url.pathname.match(/\/spreadsheets\/d\/([^/]+)/);

  if (!match) {
    throw createError("Unable to read this Google Sheet URL", 400);
  }

  const gidFromQuery = url.searchParams.get("gid");
  const gidFromHash = url.hash.match(/gid=([0-9]+)/)?.[1];
  const gid = gidFromQuery || gidFromHash || "0";

  return `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=csv&gid=${gid}`;
};

export const loadGoogleSheetRows = async (sheetUrl) => {
  const csvUrl = extractGoogleSheetCsvUrl(sheetUrl);
  const response = await fetch(csvUrl);

  if (!response.ok) {
    throw createError(
      "Could not access that Google Sheet. Make sure it is shared publicly or published to the web.",
      400
    );
  }

  const csvText = await response.text();
  const csvRows = parseCsvRows(csvText);

  if (csvRows.length < 2) {
    throw createError("The Google Sheet did not contain any product rows", 400);
  }

  return rowsToObjects(csvRows);
};
