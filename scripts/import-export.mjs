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
 * A full export runs to hundreds of megabytes — mostly video and camera-
 * resolution originals. None of that belongs in a git repo (GitHub rejects
 * files over 100MB outright and starts complaining past a gigabyte), and a
 * browser has no use for a 4000px photo in a 400px grid tile. So images are
 * resized and re-encoded on the way in, which typically takes a 500MB export
 * down to something in the tens of megabytes. Videos are skipped.
 *
 * Flags:
 *   --dir=PATH     read from somewhere other than ./import
 *   --max-width=N  longest edge in pixels (default 1600)
 *   --quality=N    JPEG quality 1-100 (default 80)
 *   --max=N        import at most N photos, newest first
 *   --no-optimize  copy originals byte-for-byte instead (not recommended)
 *   --dry-run      report what it found, write nothing
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
const NO_OPT = args.includes("--no-optimize");
const dirArg = args.find((a) => a.startsWith("--dir="));
const SOURCE = path.resolve(ROOT, dirArg ? dirArg.split("=")[1] : "import");

const numArg = (name, fallback) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  const n = hit ? Number(hit.split("=")[1]) : NaN;
  return Number.isFinite(n) ? n : fallback;
};

const MAX_WIDTH = numArg("max-width", 1600);
const QUALITY = numArg("quality", 80);
const MAX_PHOTOS = numArg("max", Infinity);

// sharp is only needed for the resize step and only ever runs on your own
// machine. If it didn't install, fall back to copying rather than failing.
let sharp = null;
if (!NO_OPT) {
  try {
    ({ default: sharp } = await import("sharp"));
  } catch {
    console.log(
      c.yellow(
        "  ! sharp isn't installed — copying originals at full size.\n" +
          "    Run `npm install` to enable resizing (strongly recommended).",
      ),
    );
  }
}

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".heic"]);
const VIDEO_EXT = new Set([".mp4", ".mov", ".m4v", ".avi", ".webm", ".gif"]);
const bytes = (n) =>
  n > 1024 ** 3
    ? `${(n / 1024 ** 3).toFixed(2)} GB`
    : `${(n / 1024 ** 2).toFixed(1)} MB`;

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
let images = postImages.length ? postImages : candidates;

if (!images.length) {
  die(
    `No images found under ${path.relative(ROOT, SOURCE)}.\n` +
      `  Make sure you unzipped the export (not just moved the .zip in) and that\n` +
      `  you requested ${c.bold("Posts")} content when you asked Meta for the download.`,
  );
}

// Report what we're leaving behind, so the size drop isn't a mystery.
const videos = allFiles.filter((f) =>
  VIDEO_EXT.has(path.extname(f).toLowerCase()),
);
const sourceBytes = images.reduce((n, f) => n + fs.statSync(f).size, 0);
const videoBytes = videos.reduce((n, f) => n + fs.statSync(f).size, 0);

console.log(
  c.dim(
    `  ${images.length} post images (${bytes(sourceBytes)})\n` +
      `  ${videos.length} videos (${bytes(videoBytes)}) — skipped\n`,
  ),
);

// Newest first, so --max keeps the most recent work rather than an arbitrary
// slice. Files without metadata fall back to their modified time.
const timeOf = (file) => {
  const rel = path.relative(SOURCE, file).replace(/\\/g, "/");
  const info =
    meta.get(rel) || [...meta.entries()].find(([uri]) => rel.endsWith(uri))?.[1];
  return info?.timestamp || fs.statSync(file).mtimeMs;
};

if (MAX_PHOTOS !== Infinity && images.length > MAX_PHOTOS) {
  images = [...images].sort((a, b) => timeOf(b) - timeOf(a)).slice(0, MAX_PHOTOS);
  console.log(c.dim(`  limiting to the newest ${MAX_PHOTOS}\n`));
}

if (sharp) {
  console.log(
    c.dim(`  resizing to ${MAX_WIDTH}px max edge, JPEG quality ${QUALITY}\n`),
  );
}

ensureDirs();

const items = [];
const usedNames = new Set();
let copied = 0;
let outBytes = 0;
let skippedTiny = 0;

for (const [index, file] of images.entries()) {
  const rel = path.relative(SOURCE, file).replace(/\\/g, "/");
  // Metadata keys are like "media/posts/202401/xyz.jpg" — match on the tail.
  const info =
    meta.get(rel) ||
    [...meta.entries()].find(([uri]) => rel.endsWith(uri))?.[1] ||
    {};

  // Stable, collision-free filename. Optimised output is always .jpg.
  let base = path
    .basename(file)
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-");
  if (sharp) base = base.replace(/\.[^.]+$/, ".jpg");
  while (usedNames.has(base)) base = `${index}-${base}`;
  usedNames.add(base);

  const dest = path.join(GALLERY_DIR, base);
  let buf = fs.readFileSync(file);
  let size = imageSize(buf);

  // Instagram exports carry stray UI assets and avatars. Anything this small
  // is not a project photo.
  if (size && (size.width < 400 || size.height < 400)) {
    skippedTiny++;
    continue;
  }

  if (sharp) {
    try {
      buf = await sharp(buf)
        .rotate() // honour EXIF orientation before stripping metadata
        .resize({
          width: MAX_WIDTH,
          height: MAX_WIDTH,
          fit: "inside",
          withoutEnlargement: true,
        })
        .jpeg({ quality: QUALITY, progressive: true, mozjpeg: true })
        .toBuffer();
      size = imageSize(buf);
    } catch (err) {
      console.log(
        c.yellow(`  ! couldn't process ${path.basename(file)} (${err.message})`),
      );
      continue;
    }
  }

  if (!DRY) fs.writeFileSync(dest, buf);
  copied++;
  outBytes += buf.length;

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
const saved = sourceBytes > 0 ? 1 - outBytes / sourceBytes : 0;

console.log(
  `\n${c.green("✓")} ${c.bold(String(items.length))} photos imported ` +
    c.dim(
      `(${withCaptions} with captions${skippedTiny ? `, ${skippedTiny} too small to use` : ""})`,
    ),
);
console.log(
  `  ${c.bold(bytes(outBytes))} total ` +
    c.dim(
      sharp
        ? `— down from ${bytes(sourceBytes)} (${(saved * 100).toFixed(0)}% smaller)`
        : "— originals copied without resizing",
    ),
);

// A repo this size still works, but it's worth knowing before pushing.
if (outBytes > 200 * 1024 ** 2) {
  console.log(
    c.yellow(
      `\n  ! That's a lot to commit. Consider a smaller --max-width, a lower\n` +
        `    --quality, or --max=N to cap how many photos go in.`,
    ),
  );
}

if (DRY) {
  console.log(c.yellow("\n  DRY RUN — nothing written\n"));
} else {
  console.log(
    c.dim(`\n  manifest → data/instagram.json\n  images   → public/gallery/\n\n`) +
      `  Next: ${c.bold("npm run dev")} to preview, then commit and push.\n`,
  );
}
