#!/usr/bin/env node
/**
 * Pull every photo from your Instagram account into this repo.
 *
 *   npm run sync:instagram
 *
 * Requires IG_ACCESS_TOKEN in .env.local (see README → "Pulling in your
 * Instagram photos"). Uses the Instagram API with Instagram Login, which is
 * what replaced the Basic Display API when Meta shut it down in Dec 2024.
 *
 * Photos are DOWNLOADED into public/gallery/ rather than hotlinked, because
 * Instagram's CDN URLs are signed and expire within days. Downloading means
 * the site keeps working forever, loads faster, and survives you deleting a
 * post. Commit the downloaded files.
 *
 * Re-running is safe and incremental: already-downloaded photos are skipped.
 *
 * Flags:
 *   --limit=N   stop after N posts (handy for a first test run)
 *   --force     re-download files that already exist
 *   --dry-run   show what would happen, write nothing
 */

import fs from "node:fs";
import path from "node:path";
import {
  GALLERY_DIR,
  c,
  captionToAlt,
  captionTags,
  die,
  ensureDirs,
  imageSize,
  loadEnv,
  readManifest,
  writeManifest,
} from "./lib/util.mjs";

loadEnv();

const API = "https://graph.instagram.com";
const VERSION = process.env.IG_API_VERSION || "v23.0";

const args = process.argv.slice(2);
const flag = (name) => args.some((a) => a === `--${name}`);
const value = (name) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split("=")[1] : null;
};

const LIMIT = value("limit") ? Number(value("limit")) : Infinity;
const FORCE = flag("force");
const DRY = flag("dry-run");

const token = process.env.IG_ACCESS_TOKEN;
if (!token) {
  die(
    `IG_ACCESS_TOKEN is not set.\n\n` +
      `  Create ${c.bold(".env.local")} in the project root containing:\n` +
      `    IG_ACCESS_TOKEN=your_long_lived_token\n\n` +
      `  See the README section ${c.bold('"Pulling in your Instagram photos"')} for how to get one.\n` +
      `  No token yet? You can use the no-API route instead:  ${c.bold("npm run import:export")}`,
  );
}

async function api(url) {
  const res = await fetch(url);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = body?.error || {};
    let hint = "";
    if (err.code === 190) {
      hint =
        `\n  Your token is expired or invalid. Long-lived tokens last 60 days.\n` +
        `  Run ${c.bold("npm run token:refresh")} to extend it, or generate a new one.`;
    } else if (err.code === 10 || err.code === 200) {
      hint =
        `\n  Missing permissions. The token needs the ${c.bold("instagram_business_basic")} scope,\n` +
        `  and the account must be a Business or Creator account (not Personal).`;
    }
    die(
      `Instagram API error ${res.status}: ${err.message || JSON.stringify(body)}${hint}`,
    );
  }
  return body;
}

/** Walk the paginated /me/media edge and collect every post. */
async function fetchAllMedia() {
  const fields = [
    "id",
    "caption",
    "media_type",
    "media_url",
    "thumbnail_url",
    "permalink",
    "timestamp",
    "username",
    "children{id,media_type,media_url,thumbnail_url}",
  ].join(",");

  let url = `${API}/${VERSION}/me/media?fields=${fields}&limit=100&access_token=${token}`;
  const posts = [];
  let page = 0;

  while (url) {
    page++;
    process.stdout.write(c.dim(`  fetching page ${page}… `));
    const body = await api(url);
    const batch = body.data || [];
    posts.push(...batch);
    console.log(c.dim(`${batch.length} posts (${posts.length} total)`));
    if (posts.length >= LIMIT) break;
    url = body.paging?.next || null;
  }

  return posts.slice(0, LIMIT === Infinity ? undefined : LIMIT);
}

/**
 * A post may be a single image, a video, or a carousel of several images.
 * Flatten all of that into one list of downloadable photos.
 */
function flattenToPhotos(posts) {
  const photos = [];

  for (const post of posts) {
    const base = {
      postId: post.id,
      caption: post.caption || "",
      permalink: post.permalink,
      timestamp: post.timestamp,
    };

    if (post.media_type === "CAROUSEL_ALBUM" && post.children?.data?.length) {
      post.children.data.forEach((child, index) => {
        const src =
          child.media_type === "VIDEO" ? child.thumbnail_url : child.media_url;
        if (!src) return;
        photos.push({
          ...base,
          id: child.id,
          src,
          isVideo: child.media_type === "VIDEO",
          albumIndex: index,
          albumSize: post.children.data.length,
        });
      });
      continue;
    }

    const src =
      post.media_type === "VIDEO" ? post.thumbnail_url : post.media_url;
    if (!src) continue;

    photos.push({
      ...base,
      id: post.id,
      src,
      isVideo: post.media_type === "VIDEO",
      albumIndex: 0,
      albumSize: 1,
    });
  }

  return photos;
}

async function download(url, destNoExt) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());

  const type = res.headers.get("content-type") || "";
  const ext = type.includes("png")
    ? ".png"
    : type.includes("webp")
      ? ".webp"
      : ".jpg";

  const dest = `${destNoExt}${ext}`;
  fs.writeFileSync(dest, buf);
  return { dest, size: imageSize(buf), bytes: buf.length };
}

function existingFileFor(id) {
  for (const ext of [".jpg", ".png", ".webp"]) {
    const p = path.join(GALLERY_DIR, `${id}${ext}`);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

async function main() {
  console.log(`\n${c.bold(c.cyan("Instagram → 30A Maintenance"))}\n`);
  if (DRY) console.log(c.yellow("  DRY RUN — nothing will be written\n"));

  ensureDirs();

  const posts = await fetchAllMedia();
  const photos = flattenToPhotos(posts);
  console.log(
    `\n  ${c.bold(String(posts.length))} posts → ${c.bold(String(photos.length))} photos\n`,
  );

  // Keep dimensions we already worked out on previous runs.
  const previous = new Map(
    (readManifest().items || []).map((item) => [item.id, item]),
  );

  const items = [];
  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const [index, photo] of photos.entries()) {
    const label = `[${String(index + 1).padStart(3)}/${photos.length}]`;
    const existing = existingFileFor(photo.id);

    let file;
    let size = previous.get(photo.id)?.width
      ? {
          width: previous.get(photo.id).width,
          height: previous.get(photo.id).height,
        }
      : null;

    if (existing && !FORCE) {
      file = `/gallery/${path.basename(existing)}`;
      if (!size) size = imageSize(fs.readFileSync(existing));
      skipped++;
      console.log(c.dim(`  ${label} ✓ have  ${path.basename(existing)}`));
    } else if (DRY) {
      file = `/gallery/${photo.id}.jpg`;
      console.log(`  ${label} ${c.cyan("↓ would download")} ${photo.id}`);
    } else {
      try {
        const out = await download(
          photo.src,
          path.join(GALLERY_DIR, String(photo.id)),
        );
        file = `/gallery/${path.basename(out.dest)}`;
        size = out.size;
        downloaded++;
        console.log(
          `  ${label} ${c.green("↓")} ${path.basename(out.dest)} ${c.dim(
            `${(out.bytes / 1024).toFixed(0)}kb${
              out.size ? ` · ${out.size.width}×${out.size.height}` : ""
            }`,
          )}`,
        );
      } catch (err) {
        failed++;
        console.log(`  ${label} ${c.red("✗")} ${photo.id} — ${err.message}`);
        continue;
      }
    }

    items.push({
      id: photo.id,
      postId: photo.postId,
      src: file,
      width: size?.width ?? null,
      height: size?.height ?? null,
      caption: photo.caption,
      alt: captionToAlt(photo.caption, "Project photo by 30A Maintenance"),
      tags: captionTags(photo.caption),
      permalink: photo.permalink,
      timestamp: photo.timestamp,
      isVideo: photo.isVideo,
      albumIndex: photo.albumIndex,
      albumSize: photo.albumSize,
    });
  }

  // Newest first.
  items.sort((a, b) => {
    const t = new Date(b.timestamp) - new Date(a.timestamp);
    return t !== 0 ? t : a.albumIndex - b.albumIndex;
  });

  if (!DRY) {
    writeManifest(items, { source: "instagram-api", posts: posts.length });
  }

  console.log(
    `\n${c.green("✓")} ${c.bold(String(items.length))} photos in the gallery ` +
      c.dim(`(${downloaded} new, ${skipped} already had${failed ? `, ${failed} failed` : ""})`),
  );
  if (!DRY) {
    console.log(
      c.dim(
        `  manifest → data/instagram.json\n  images   → public/gallery/\n\n`,
      ) + `  Next: ${c.bold("git add -A && git commit -m 'Sync Instagram photos' && git push")}\n`,
    );
  }
}

main().catch((err) => die(err.stack || err.message));
