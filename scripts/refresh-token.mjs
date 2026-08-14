#!/usr/bin/env node
/**
 * Extend a long-lived Instagram token for another 60 days.
 *
 *   npm run token:refresh
 *
 * The token must be at least 24 hours old and not yet expired. If you let one
 * lapse you have to generate a fresh short-lived token and re-run
 * `npm run token:exchange`.
 */

import { c, die, loadEnv } from "./lib/util.mjs";

loadEnv();

const token = process.env.IG_ACCESS_TOKEN;
if (!token) die(`IG_ACCESS_TOKEN is not set in .env.local`);

const url =
  `https://graph.instagram.com/refresh_access_token` +
  `?grant_type=ig_refresh_token&access_token=${token}`;

const res = await fetch(url);
const body = await res.json();

if (!res.ok) {
  die(
    `Refresh failed: ${body?.error?.message || JSON.stringify(body)}\n\n` +
      `  If the token already expired, generate a new short-lived token in the\n` +
      `  Meta dashboard and run ${c.bold("npm run token:exchange")} instead.`,
  );
}

const days = Math.round((body.expires_in || 0) / 86400);

console.log(`\n${c.green("✓")} Refreshed — valid another ~${days} days:\n`);
console.log(`${c.bold(body.access_token)}\n`);
console.log(c.dim(`Update .env.local:\n`) + `    IG_ACCESS_TOKEN=${body.access_token}\n`);
