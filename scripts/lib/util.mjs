import fs from "node:fs";
import path from "node:path";

export const ROOT = path.resolve(new URL("../..", import.meta.url).pathname);
export const GALLERY_DIR = path.join(ROOT, "public", "gallery");
export const DATA_FILE = path.join(ROOT, "data", "instagram.json");

/** Minimal .env / .env.local loader so you don't need a dotenv dependency. */
export function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    const p = path.join(ROOT, file);
    if (!fs.existsSync(p)) continue;
    for (const rawLine of fs.readFileSync(p, "utf8").split("\n")) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq === -1) continue;
      const key = line.slice(0, eq).trim();
      let value = line.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    }
  }
}

export const c = {
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
};

export function die(msg) {
  console.error(`\n${c.red("✗")} ${msg}\n`);
  process.exit(1);
}

/**
 * Read image dimensions straight from the file header.
 * Supports JPEG, PNG and WebP — which covers everything Instagram serves.
 * Returns null if the format isn't recognised; the site falls back to a
 * square tile in that case, so this is never fatal.
 */
export function imageSize(buf) {
  // PNG
  if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }

  // WebP (RIFF container)
  if (
    buf.length > 30 &&
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP"
  ) {
    const type = buf.toString("ascii", 12, 16);
    if (type === "VP8X") {
      return {
        width: 1 + buf.readUIntLE(24, 3),
        height: 1 + buf.readUIntLE(27, 3),
      };
    }
    if (type === "VP8 ") {
      return {
        width: buf.readUInt16LE(26) & 0x3fff,
        height: buf.readUInt16LE(28) & 0x3fff,
      };
    }
    if (type === "VP8L") {
      const bits = buf.readUInt32LE(21);
      return {
        width: (bits & 0x3fff) + 1,
        height: ((bits >> 14) & 0x3fff) + 1,
      };
    }
  }

  // JPEG — walk the marker segments looking for a Start-Of-Frame.
  if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let offset = 2;
    while (offset < buf.length - 9) {
      if (buf[offset] !== 0xff) {
        offset++;
        continue;
      }
      const marker = buf[offset + 1];
      // Standalone markers carry no length payload.
      if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
        offset += 2;
        continue;
      }
      if (marker === 0xd9 || marker === 0xda) break; // EOI / start of scan
      const length = buf.readUInt16BE(offset + 2);
      const isSOF =
        marker >= 0xc0 &&
        marker <= 0xcf &&
        marker !== 0xc4 &&
        marker !== 0xc8 &&
        marker !== 0xcc;
      if (isSOF) {
        return {
          height: buf.readUInt16BE(offset + 5),
          width: buf.readUInt16BE(offset + 7),
        };
      }
      offset += 2 + length;
    }
  }

  return null;
}

/** Instagram captions carry hashtags and emoji — clean them up for alt text. */
export function captionToAlt(caption, fallback) {
  if (!caption) return fallback;
  const cleaned = caption
    .replace(/#[\wÀ-ɏ]+/g, " ") // hashtags
    .replace(/@[\w.]+/g, " ") // mentions
    .replace(/https?:\/\/\S+/g, " ") // links
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, " ") // emoji
    .replace(/\s+/g, " ")
    .trim();
  if (cleaned.length < 4) return fallback;
  const firstSentence = cleaned.split(/(?<=[.!?])\s/)[0];
  const text = firstSentence.length > 12 ? firstSentence : cleaned;
  return text.length > 160 ? `${text.slice(0, 157).trimEnd()}…` : text;
}

/** Pull hashtags out of a caption so the gallery can offer filters. */
export function captionTags(caption) {
  if (!caption) return [];
  const found = caption.match(/#[\wÀ-ɏ]+/g) || [];
  return [...new Set(found.map((t) => t.slice(1).toLowerCase()))];
}

export function ensureDirs() {
  fs.mkdirSync(GALLERY_DIR, { recursive: true });
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
}

export function writeManifest(items, meta = {}) {
  const payload = {
    syncedAt: new Date().toISOString(),
    count: items.length,
    ...meta,
    items,
  };
  fs.writeFileSync(DATA_FILE, `${JSON.stringify(payload, null, 2)}\n`);
  return payload;
}

export function readManifest() {
  if (!fs.existsSync(DATA_FILE)) return { items: [] };
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch {
    return { items: [] };
  }
}
