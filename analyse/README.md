# analyse/ — frozen evidence (read-only)

Until 2026-11-13 this folder held every dated analysis, screenshot, build trace and operation receipt (≈378 MB, 4,593 files). It was slimmed to the files that `content/`, `docs/`, `supabase/` and `AGENTS.md` still cite (content provenance for the reviewed yoga library, the content-workspace plan, staging receipts).

- **Everything removed is still in git:** tag `archive/analyse-2026-11-13`. Restore one item with `git checkout archive/analyse-2026-11-13 -- analyse/<path>` (do not commit it back unless a live document needs it).
- **Do not add new files here.** Plans go to `plans/`, current status to `PLAN.md`, dated status to `docs/status/`, test screenshots to `test-results/` (ignored), large binaries outside the repo. New files under `analyse/` are ignored by `.gitignore`.
- Do not rename or move the kept files: reviewed content units record these paths and their hashes.
