# Node13 plan v4 — separate immutable root GO filename

PREPARED / NOT INVOKED. v3 uninvoked script/plan retained unchanged; initial ROOT-INVOCATION-GO.json SHA1be48…e026 must remain historical evidence for v2 pre-child block and independent ownprobe. New v4 wrapper binds a separately created `ROOT-NODE13-V4-GO.json`; never overwrite the initial GO.

`run-node13-v4.ps1` SHA256 `4fe0d3c5fd8a1944bfce60e4cb4f73b2f1bffdb61fa4ce43f4f70216202da3b8`. Static PowerShell parse PASS/exit0. Exact diff from v3 SHA93479…33989: only `$goPath` filename ROOT-INVOCATION-GO.json→ROOT-NODE13-V4-GO.json and receipt schema.v3→v4. No other line/behavior change.

Candidate freeze remains6af8eb4daf3838d8abd44edfaa0009619e54b1ad42001c4c5b4869a6b9dabc5e. Runtime still literal `C:\Program Files\nodejs\node.exe`, Test-Path Leaf + SHA98843732431bad6c2c165908bb7dde6fe2a221ddbc491a955d548a2e6ab9ebff/fileVersion25.9.0. Exact3 tests/TAP,6OSenv,60s timeout,output node13-v1/refuse existing,owned process cleanup,pre/post255+59+71 and preserved old/rootpins,13pass/no fail/skip/cancel+child0 unchanged. Prior block d37514…8215b remains NOT_RUN for tests, no retry already occurred. Independent ownprobe already PASS, no rerun requested.

After actual v4 QC and root creates NEW GO, execute once from repo root:

```text
pwsh -NoProfile -File analyse/ux-step5-3-snapshot-2026-10-19/run-node13-v4.ps1 -ExpectedGoSha256 <actual-ROOT-NODE13-V4-GO.json-SHA256>
```

Child command/cwd remain:

```text
C:/Program Files/nodejs/node.exe --test --test-reporter=tap server/contentReview/canonicalAdapter.test.mjs server/contentReview/reviewModel.test.mjs server/contentReview/localReviewServer.test.mjs
```

cwd `.vercel/ux-step5-3-rebind-20261019-v1`. No invocation permission is inferred from preparing v4. Keep old GO/wrappers/plans and failures unchanged. No Owner server/browser before separate root GO after Node13/QC. App/canonical untouched.
