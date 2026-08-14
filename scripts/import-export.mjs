#!/usr/bin/env node
/**
 * Build the gallery from Instagram's official data export — no API app, no
 * token, no 60-day expiry. This is the fastest way to get *every* photo,
 * including old posts, and it is the recommended route if you only plan to
 * refresh the site occasionally.
 *
 *   1. Instagram → Settings → Accounts Centre → Your information and permissions
 *      → Download your information → request a download of "Posts",
 *      format JSON, quality High.
 *   2. Meta emails you a zip (usually within a few hours).
 *   3. Unzip it into ./import in this project.
 *   4. npm run import:export
 *
 * Flags:
 *   --dir=PATH   read from somewhere other than ./import
 *   --dry-run    report what it found, write nothing
 */

import fs from "node:fs";
import path from "node:path";
import {
  GALLERY_DIR,
  ROOT,
  c,
  captionToAlt,
  captionTags,
  die,
  ensureDirs,
  imageSize,
  writeManifest,
} from "./lib/util.mjs";

const args = process.argv.slice(2);
const DRY = args.includes("--dry-run");
const dirArg = args.find((a) => a.startsWith("--dir="));
const SOURCE = path.resolve(ROOT, dirArg ? dirArg.split("=")[1] : "import");

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".heic"]);

if (!fs.existsSync(SOURCE)) {
  die(
    `No export found at ${c.bold(path.relative(ROOT, SOURCE) || SOURCE)}\n\n` +
      `  Unzip your Instagram data export into that folder, then run this again.\n` +
      `  See the README section ${c.bold('"Option B — the data export"')}.`,
  );
}

/** Instagram writes UTF-8 bytes but labels them latin-1, mangling emoji/accents. */
function fixMojibake(str) {
  if (typeof str !== "string") return str;
  try {
    const repaired = Buffer.from(str, "latin1").toString("utf8");
    return repaired.includes("�") ? str : repaired;
  } catch {
    return str;
  }
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

console.log(`\n${c.bold(c.cyan("Instagram export → 30A Maintenance"))}\n`);
console.log(c.dim(`  reading ${path.relative(ROOT, SOURCE)}\n`));

const allFiles = walk(SOURCE);

// ── Find the posts metadata (its path has moved between export versions) ────
const postFiles = allFiles.filter((f) =>
  /(^|[\\/])posts_\d+\.json$/i.test(f),
);

/** uri (relative path inside the export) → { caption, timestamp } */
const meta = new Map();

for (const file of postFiles) {
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    console.log(c.yellow(`  ! could not parse ${path.basename(file)}, skipping`));
    continue;
  }
  const posts = Array.isArray(parsed) ? parsed : parsed.media || [];
  for (const post of posts) {
    const media = Array.isArray(post.media) ? post.media : [post];
    const albumCaption = fixMojibake(post.title || "");
    media.forEach((m, index) => {
      if (!m?.uri) return;
      meta.set(m.uri.replace(/\\/g, "/"), {
        caption: fixMojibake(m.title || "") || albumCaption,
        timestamp: (m.creation_timestamp || post.creation_timestamp || 0) * 1000,
        albumIndex: index,
        albumSize: media.length,
      });
    });
  }
}

console.log(
  c.dim(
    `  ${postFiles.length} metadata file(s), ${meta.size} media entries with captions`,
  ),
);

// ── Collect the actual image files ──────────────────────────────────────────
// Prefer anything under a "posts" folder; fall back to every image in the
// export if the layout is unfamiliar (but never profile pics / stories).
const candidates = allFiles.filter((f) => {
  if (!IMAGE_EXT.has(path.extname(f).toLowerCase())) return false;
  const rel = path.relative(SOURCE, f).replace(/\\/g, "/").toLowerCase();
  if (/(^|\/)(profile_photos|stories|reels_profile|avatars|thumbnails)\//.test(rel))
    return false;
  return true;
});

const postImages = candidates.filter((f) =>
  /(^|\/)(media\/)?posts\//i.test(path.relative(SOURCE, f).replace(/\\/g, "/")),
);
const images = postImages.length ? postImages : candidates;

if (!images.length) {
  die(
    `No images found under ${path.relative(ROOT, SOURCE)}.\n` +
      `  Make sure you unzipped the export (not just moved the .zip in) and that\n` +
      `  you requested ${c.bold("Posts")} content when you asked Meta for the download.`,
  );
}

console.log(c.dim(`  ${images.length} post images found\n`));

ensureDirs();

const items = [];
const usedNames = new Set();
let copied = 0;

for (const [index, file] of images.entries()) {
  const rel = path.relative(SOURCE, file).replace(/\\/g, "/");
  // Metadata keys are like "media/posts/202401/xyz.jpg" — match on the tail.
  const info =
    meta.get(rel) ||
    [...meta.entries()].find(([uri]) => rel.endsWith(uri))?.[1] ||
    {};

  // Stable, collision-free filename.
  let base = path
    .basename(file)
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-");
  while (usedNames.has(base)) base = `${index}-${base}`;
  usedNames.add(base);

  const dest = path.join(GALLERY_DIR, base);
  const buf = fs.readFileSync(file);
  if (!DRY) fs.writeFileSync(dest, buf);
  copied++;

  const size = imageSize(buf);
  const caption = info.caption || "";
  const timestamp = info.timestamp
    ? new Date(info.timestamp).toISOString()
    : fs.statSync(file).mtime.toISOString();

  items.push({
    id: base.replace(/\.[^.]+$/, ""),
    postId: null,
    src: `/gallery/${base}`,
    width: size?.width ?? null,
    height: size?.height ?? null,
    caption,
    alt: captionToAlt(caption, "Project photo by 30A Maintenance"),
    tags: captionTags(caption),
    permalink: null,
    timestamp,
    isVideo: false,
    albumIndex: info.albumIndex ?? 0,
    albumSize: info.albumSize ?? 1,
  });

  if (copied % 25 === 0) console.log(c.dim(`  … ${copied}/${images.length}`));
}

items.sort((a, b) => {
  const t = new Date(b.timestamp) - new Date(a.timestamp);
  return t !== 0 ? t : a.albumIndex - b.albumIndex;
});

if (!DRY) writeManifest(items, { source: "instagram-export" });

const withCaptions = items.filter((i) => i.caption).length;

console.log(
  `\n${c.green("✓")} ${c.bold(String(items.length))} photos imported ` +
    c.dim(`(${withCaptions} with captions)`),
);
if (DRY) {
  console.log(c.yellow("  DRY RUN — nothing written\n"));
} else {
  console.log(
    c.dim(`  manifest → data/instagram.json\n  images   → public/gallery/\n\n`) +
      `  Next: ${c.bold("npm run dev")} to preview, then commit and push.\n`,
  );
}
