import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(scriptDir, "../public");

const palette = {
  background: [15, 23, 42, 255],
  accent: [20, 184, 166, 255],
  cardLight: [248, 250, 252, 255],
  cardMuted: [203, 213, 225, 255],
  cardWarm: [251, 191, 36, 255]
};

const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

const crcTable = (() => {
  const table = new Uint32Array(256);

  for (let index = 0; index < 256; index += 1) {
    let value = index;

    for (let bit = 0; bit < 8; bit += 1) {
      value = (value & 1) === 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }

    table[index] = value >>> 0;
  }

  return table;
})();

const crc32 = (buffer) => {
  let crc = 0xffffffff;

  for (const byte of buffer) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
};

const createChunk = (type, data) => {
  const typeBuffer = Buffer.from(type);
  const lengthBuffer = Buffer.alloc(4);
  lengthBuffer.writeUInt32BE(data.length, 0);

  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);

  return Buffer.concat([lengthBuffer, typeBuffer, data, crcBuffer]);
};

const isInRoundedRect = (x, y, left, top, width, height, radius) => {
  const right = left + width;
  const bottom = top + height;

  if (x >= left + radius && x < right - radius && y >= top && y < bottom) {
    return true;
  }

  if (x >= left && x < right && y >= top + radius && y < bottom - radius) {
    return true;
  }

  const corners = [
    [left + radius, top + radius],
    [right - radius - 1, top + radius],
    [left + radius, bottom - radius - 1],
    [right - radius - 1, bottom - radius - 1]
  ];

  return corners.some(([cx, cy]) => (x - cx) ** 2 + (y - cy) ** 2 <= radius ** 2);
};

const getPixelColor = (x, y, size, maskable = false) => {
  const safeInset = maskable ? size * 0.08 : size * 0.12;
  const bgRadius = size * (maskable ? 0.24 : 0.22);
  const headerHeight = size * 0.16;
  const headerRadius = headerHeight / 2;
  const cardGap = size * 0.06;
  const cardTop = safeInset + headerHeight + size * 0.1;
  const cardHeight = size * 0.32;
  const cardWidth = (size - safeInset * 2 - cardGap * 2) / 3;
  const cardRadius = size * 0.08;

  if (!isInRoundedRect(x, y, safeInset, safeInset, size - safeInset * 2, size - safeInset * 2, bgRadius)) {
    return [0, 0, 0, 0];
  }

  let color = palette.background;

  if (
    isInRoundedRect(
      x,
      y,
      safeInset + size * 0.06,
      safeInset + size * 0.1,
      size - safeInset * 2 - size * 0.12,
      headerHeight,
      headerRadius
    )
  ) {
    color = palette.accent;
  }

  const cardColors = [palette.cardLight, palette.cardMuted, palette.cardWarm];

  for (let index = 0; index < 3; index += 1) {
    const cardLeft = safeInset + index * (cardWidth + cardGap);

    if (isInRoundedRect(x, y, cardLeft, cardTop, cardWidth, cardHeight, cardRadius)) {
      color = cardColors[index];
    }
  }

  return color;
};

const createIcon = (size, maskable = false) => {
  const raw = Buffer.alloc((size * 4 + 1) * size);

  for (let y = 0; y < size; y += 1) {
    const rowOffset = y * (size * 4 + 1);
    raw[rowOffset] = 0;

    for (let x = 0; x < size; x += 1) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = getPixelColor(x, y, size, maskable);
      raw[pixelOffset] = r;
      raw[pixelOffset + 1] = g;
      raw[pixelOffset + 2] = b;
      raw[pixelOffset + 3] = a;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    pngSignature,
    createChunk("IHDR", ihdr),
    createChunk("IDAT", zlib.deflateSync(raw)),
    createChunk("IEND", Buffer.alloc(0))
  ]);
};

mkdirSync(publicDir, { recursive: true });

writeFileSync(resolve(publicDir, "pwa-192x192.png"), createIcon(192));
writeFileSync(resolve(publicDir, "pwa-512x512.png"), createIcon(512));
writeFileSync(resolve(publicDir, "pwa-maskable-192x192.png"), createIcon(192, true));
writeFileSync(resolve(publicDir, "pwa-maskable-512x512.png"), createIcon(512, true));
writeFileSync(resolve(publicDir, "apple-touch-icon.png"), createIcon(180));

console.log("Generated PWA icons in", publicDir);
