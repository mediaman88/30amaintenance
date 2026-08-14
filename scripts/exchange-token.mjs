#!/usr/bin/env node
/**
 * Trade a short-lived Instagram token (1 hour) for a long-lived one (60 days).
 *
 *   npm run token:exchange
 *
 * Needs IG_SHORT_TOKEN and IG_APP_SECRET in .env.local.
 */

import { c, die, loadEnv } from "./lib/util.mjs";

loadEnv();

const short = process.env.IG_SHORT_TOKEN;
const secret = process.env.IG_APP_SECRET;

if (!short || !secret) {
  die(
    `Set both of these in ${c.bold(".env.local")}:\n` +
      `    IG_SHORT_TOKEN=...   (from the Meta dashboard's token generator)\n` +
      `    IG_APP_SECRET=...    (App settings → Basic → App secret)`,
  );
}

const url =
  `https://graph.instagram.com/access_token` +
  `?grant_type=ig_exchange_token&client_secret=${secret}&access_token=${short}`;

const res = await fetch(url);
const body = await res.json();

if (!res.ok) die(`Exchange failed: ${body?.error?.message || JSON.stringify(body)}`);

const days = Math.round((body.expires_in || 0) / 86400);

console.log(`\n${c.green("✓")} Long-lived token (valid ~${days} days):\n`);
console.log(`${c.bold(body.access_token)}\n`);
console.log(c.dim(`Put it in .env.local as:\n`) + `    IG_ACCESS_TOKEN=${body.access_token}\n`);
console.log(
  c.dim(`Then run `) + c.bold("npm run sync:instagram") + c.dim(` to pull your photos.\n`),
);
