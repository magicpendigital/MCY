# Node13 plan v2 — explicit TAP format correction

PREPARED / CHƯA CHẠY. Supersedes the reporter assumption in NODE13-PLAN.vi.md; retains that file and run-node13.ps1 SHA `28a190d42b7c08f61df3c1d5376df1721a764e84722df56b45ee4ff2290e2f6c` unchanged as uninvoked history. Root identified Node25 prior stdout used the default spec reporter with ℹ summary, while wrapper asserted TAP # summary. No known-failing invocation was attempted.

Actual new wrapper `run-node13-v2.ps1` SHA `2caca1408248b6a1358656b20a8fba738b8abcd697e5b152cac3ce5e9d661524` explicitly selects TAP. Only CLI ArgumentList, receipt command and receipt schema.v2 differ from the prior draft; tests, assertions, six OS env keys,60s timeout, exact child ownership, pre/post pins and PASS criteria remain unchanged. Static PowerShell parse PASS/exit0, no Node test/control/server/browser invocation. Candidate freeze remains `6af8eb4daf3838d8abd44edfaa0009619e54b1ad42001c4c5b4869a6b9dabc5e`.

Exact child command, cwd new candidate:

```text
C:/Program Files/nodejs/node.exe --test --test-reporter=tap server/contentReview/canonicalAdapter.test.mjs server/contentReview/reviewModel.test.mjs server/contentReview/localReviewServer.test.mjs
```

After independent source/wrapper QC and root invocation GO, call from repo root:

```text
pwsh -NoProfile -File analyse/ux-step5-3-snapshot-2026-10-19/run-node13-v2.ps1 -ExpectedGoSha256 <actual-root-invocation-GO-SHA256>
```

Future ROOT-INVOCATION-GO.json must be pinned by actual root-issued SHA, not preparation GO. Refuse existing node13-v1 output; same unique folder reserved because no prior execution occurred. Receipt records actual v2 script SHA/command, child exit/timeout,13tests/13pass/0fail/0skip/0cancel TAP summary and pre/post preservation. PASS requires successful process exit and all assertions/pins; no changes to frozen tests or control code. Root actual Owner preview requires separate GO.
