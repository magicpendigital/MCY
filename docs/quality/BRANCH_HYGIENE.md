# MCY branch hygiene — keep `main` complete

Rule summary lives in [AGENTS.md](../../AGENTS.md) ("Branches and outside actions"). This file is the procedure. Established 2026-11-15.

## Principle

`main` holds the newest and most complete state of the project. Anything finished but not in `main` is lost work waiting to happen. Anything in `main` is recoverable. So: commit small, merge when done, delete the branch.

| Branch | Role | Rule |
|---|---|---|
| `main` | Single source of truth, builds Vercel Preview | Receives every finished task by `merge --no-ff`. Push only on the Owner's request. |
| `production` | Parked Vercel Production branch (= old prototype) | Never push. |
| `origin/codex-mcy-p1-preview` | Frozen history, fully inside `main` | Never push. Local copy deleted. |
| `claude/*`, `codex/*`, `mca/*` | One task each, short-lived | Delete after merge. |
| `mca/run-*`, `mca/<run>/<task>` | mca integration + task branches | Delete both after the run is merged into `main`. |
| `backup/*` | Safety copy before a risky rewrite | Becomes tag `archive/<name>` once the Owner confirms it is redundant, then branch deleted. |

## Start of session

```bash
git status --short
git branch -vv
git worktree list
git branch --no-merged main
```

Never reset or overwrite a worktree that has uncommitted changes you did not make.

## Finishing a task

1. Gates for the risk tier pass (`npm run check:quick` at least; see the review matrix).
2. `PLAN.md` updated in the same branch.
3. Commit on the task branch, then from the checkout that has `main`: `git merge --no-ff <branch>`.
4. Re-run `npm run check:quick` on `main`.
5. Close out (below). Push only if the Owner asked in this task.

## Close-out (free space)

A branch may be deleted only when **all** hold: `git branch --merged main` lists it, its worktree (if any) has no uncommitted or untracked files (`git -C <wt> status --short` empty), no entry in `plans/active/` names it, and no session is running in it.

```bash
git worktree remove <path>     # refuses if the tree is dirty; do not use --force
git branch -d <branch>         # refuses if unmerged; never use -D
git worktree prune
git gc                         # optional, reclaims space after many deletions
```

Remote branches other than `main` and `production` are deleted only on the Owner's request.

## Not merged / not committed

A branch that is not merged, or a worktree with uncommitted files, is never deleted by an agent. List it in the report with the reason and who owns it (open task, Owner decision, abandoned). An abandoned old tree is a question for the Owner, not a cleanup target.

## Review log

- 2026-11-15: deleted 9 merged local branches (`claude/mca-plugin-repo-restructure-a79255`, `claude/yoga-app-strategy-analysis-8ae991`, mca lát 1–3 task and run branches, local `codex-mcy-p1-preview`) and 2 clean worktrees. Kept: `main`, lát 4 (open, uncommitted work in its worktree), two `backup/*` branches (unmerged, awaiting Owner), old Codex worktree `pilot-web-android-20261021` (dirty, awaiting Owner).
