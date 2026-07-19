# Mock demo theme sync — how it works

## What changed in this pass
The real product app (`frontend.zip`) and the marketing site's mock
demo had drifted apart — the app now ships **11 real themes**
(Brownish White, Neutral Gray, Corporate Blue, Slate Teal, Graphite in
light; Matte Black, Black Navy, Charcoal, Corporate Blue, Slate Teal,
Graphite in dark), but the mock demo still had a fictional 22-theme
picker (Ivory & Champagne, Cashmere & Sage, etc.) with different CSS
variable names. Both have now been brought back in sync by hand, once:

- `live-demo-assets/theme.css`, `agent.css`, `admin.css`, `widget.css`
  are now direct copies of the real app's CSS.
- The theme picker dropdowns in `demo-admin.html` and `demo-agent.html`
  now list the real 11 themes with the real names/values.
- Default-theme fallback JS (`light`/`dark`) updated to the real app's
  actual default attribute values (`light-offwhite` / `dark-matte`).

## Why this won't need to be a manual job again
The real app is a **plain static site** too (no build step) — its CSS
files are already served as public files at fixed paths
(`/agent/theme.css`, `/agent/agent.css`, `/agent/admin.css`,
`/widget.css`). That means there's nothing to "export" — those files
already ARE the single source of truth, live, at all times.

`scripts/sync-theme-from-live-app.js` fetches those 4 URLs from the
live app and overwrites the matching files in `live-demo-assets/`.
That's the entire sync — no JSON layer, no generation step.

`.github/workflows/sync-theme.yml` runs that script and commits +
pushes if anything changed → Netlify (connected to this repo)
redeploys automatically. It runs on:
- **`repository_dispatch` (event: `theme-updated`)** — fired by the
  main app repo right after a production deploy (near-instant path).
- **A 12-hour cron** — safety net only, in case a dispatch is missed.

## One thing left to fill in
Both `.github/workflows/sync-theme.yml` (this repo) and
`MAIN-APP-INTEGRATION/notify-site-theme-changed.yml` (goes in the
main app repo) have a placeholder:
- `https://<your-live-app-domain>` → your live app's real domain
- `<your-github-username>/<wrennon-site-repo>` → this repo's real path

## Setup steps (main app repo side)
1. Add `MAIN-APP-INTEGRATION/notify-site-theme-changed.yml` to
   `<main-app-repo>/.github/workflows/`.
2. Create a fine-grained GitHub PAT scoped to just this site repo
   (Contents: read/write), and store it as `SITE_REPO_PAT` in the
   main app repo's secrets.
3. Fill in the two placeholders mentioned above in both workflow
   files.

Once that's done: change a theme in the product → push → Vercel
deploys → main app's Action notifies this repo → this repo's Action
pulls the 4 CSS files fresh → commits → Netlify redeploys. No manual
CSS editing, ever, unless the theme *system* itself changes shape
(new variable names, new theme count) — in which case the picker
dropdown HTML (not just CSS) needs a manual update, same as this pass.
