# Node13 plan v3 — explicit approved runtime binding

PREPARED / CHƯA INVOCATION v3. Candidatefreeze `6af8eb4daf3838d8abd44edfaa0009619e54b1ad42001c4c5b4869a6b9dabc5e` unchanged. Root authorized only runtime-binding correction after `NODE13-PRECHILD-BLOCK-v1.json` SHA `d37514a99c7e347aac0fdbaa64c55b2a173da434dadadc74007620aabe48215b`; v2 script/plan and blocked attempt retained. v2 process exit1 happened before child and is NOT_RUN for Node13, not a test failure or retroactive PASS.

New wrapper `run-node13-v3.ps1` SHA `93479b1b316bac47fbdd3c8ed91d40790e7fb63e1bccdf0e2c77cb1f87233989`, PowerShell static parse PASS/exit0. Diff vs v2 only runtime binding and receipt metadata/schema.v3: replace ambiguous Get-Command .Source array with literal `C:\Program Files\nodejs\node.exe`, require Test-Path Leaf, exact binary SHA256 and file-version metadata; receipt records binary hash/version. No subprocess was run to read version.

Observed intended runtime: absolute path above; SHA256 `98843732431bad6c2c165908bb7dde6fe2a221ddbc491a955d548a2e6ab9ebff`;95,618,048bytes; fileVersion/productVersion25.9.0. This matches historical Node25.9 environment instead of the second ambient Node24.19.

Command remains exact3 frozen tests with explicit TAP:

```text
C:/Program Files/nodejs/node.exe --test --test-reporter=tap server/contentReview/canonicalAdapter.test.mjs server/contentReview/reviewModel.test.mjs server/contentReview/localReviewServer.test.mjs
```

After QC of actualv3 and NEW root invocation GO hash, use:

```text
pwsh -NoProfile -File analyse/ux-step5-3-snapshot-2026-10-19/run-node13-v3.ps1 -ExpectedGoSha256 <new-actual-root-invocation-GO-SHA256>
```

All previous v2 guards unchanged: only6OSenv,60s test child timeout,exact owned Process cleanup,unique node13-v1 output/refuse existing,pre/post255source+59client+71canonical/root35/oldsource255+client59/evidence,13pass/no fail/skip/cancel plus process exit0. No assertion weakening or source/test change. Independent ownprobe already passed, no repeat needed. v3 needs new root GO; old GO authorized v2 and is not silently reused. Owner4260/browser still blocked until separate GO after Node13/QC.
