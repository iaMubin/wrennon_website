#!/usr/bin/env node
/**
 * Pulls the CURRENT live design CSS straight from the product app and
 * overwrites the mock demo's copies. Nothing to export or transform —
 * the app is a static site too, so its CSS files ARE the source of
 * truth already, served as plain public files.
 *
 * Usage:
 *   LIVE_APP_ORIGIN=https://<your-live-app-domain> node scripts/sync-theme-from-live-app.js
 */

const fs = require("fs");
const path = require("path");

const ORIGIN = process.env.LIVE_APP_ORIGIN;

// Maps: live app path -> local file in this repo
const FILES = [
  { src: "/agent/theme.css", dest: "live-demo-assets/theme.css" },
  { src: "/agent/agent.css", dest: "live-demo-assets/agent.css" },
  { src: "/agent/admin.css", dest: "live-demo-assets/admin.css" },
  { src: "/widget.css", dest: "live-demo-assets/widget.css" },
];

async function fetchText(url) {
  const res = await fetch(url, { headers: { "cache-control": "no-cache" } });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  return res.text();
}

async function main() {
  if (!ORIGIN) {
    console.error("LIVE_APP_ORIGIN env var not set (e.g. https://app.wrennon.com) — nothing to sync.");
    process.exit(1);
  }

  let changed = false;
  for (const file of FILES) {
    const url = ORIGIN.replace(/\/$/, "") + file.src;
    const fresh = await fetchText(url);
    const destPath = path.join(__dirname, "..", file.dest);
    const current = fs.existsSync(destPath) ? fs.readFileSync(destPath, "utf-8") : null;

    if (current !== fresh) {
      fs.writeFileSync(destPath, fresh);
      console.log(`Updated ${file.dest} from ${url}`);
      changed = true;
    } else {
      console.log(`No change: ${file.dest}`);
    }
  }

  if (!changed) {
    console.log("Nothing changed — demo already matches the live app.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
