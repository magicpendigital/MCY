import * as fs from 'node:fs';
import { createHash } from 'node:crypto';
const base = 'analyse/ux-step5-3-2026-10-18';
const out = `${base}/headless-shell-provision-v2`;
const pin = path => ({ path, bytes: fs.statSync(path).size, sha256: createHash('sha256').update(fs.readFileSync(path)).digest('hex') });
const check = x => ({ ...pin(x.path), expected: x.sha256, match: pin(x.path).sha256 === x.sha256 });
const mode = process.argv[2];
if (mode === 'lock-before' || mode === 'lock-after') {
  const path = 'D:/Projects/MCY/.vercel/ux-step5-3-browser-tools/__dirlock';
  const stat = fs.lstatSync(path);
  const observation = { capturedAt: new Date().toISOString(), absolutePath: path, realpath: fs.realpathSync(path),
    isDirectory: stat.isDirectory(), isSymbolicLink: stat.isSymbolicLink(), entryCount: stat.isDirectory() ? fs.readdirSync(path).length : null,
    creationTimeUtc: stat.birthtime.toISOString(), lastWriteTimeUtc: stat.mtime.toISOString(), modified: false };
  const dest = `${out}/${mode}.json`;
  fs.writeFileSync(dest, `${JSON.stringify(observation, null, 2)}\n`);
  console.log(JSON.stringify({ ...observation, evidence: pin(dest) }));
} else if (mode === 'report') {
  const old = JSON.parse(fs.readFileSync(`${base}/chromium-provision-v1/artifact-manifest.json`));
  const v1 = JSON.parse(fs.readFileSync(`${base}/HEADLESS-SHELL-PROVISION-EXECUTION-v1.json`));
  const sources = old.toolPins.map(check), files = old.files.map(check), additional = v1.newArtifacts.map(check);
  const report = { scope: 'V2_OFFICIAL_CLI_TIMEOUT_NO_RETRY_NO_BROWSER', capturedAt: new Date().toISOString(),
    receipt: JSON.parse(fs.readFileSync(`${out}/receipt.json`)), cleanup: JSON.parse(fs.readFileSync(`${out}/cleanup-observation.json`)),
    toolSourcePins: sources, existingToolPins: files, existingAdditionalDbPins: additional,
    evidence: ['receipt.json', 'stdout.log', 'stderr.log', 'cleanup-observation.json'].map(x => pin(`${out}/${x}`)),
    headlessShellInstalled: false, cacheLock: 'PRESENT_LEFT_UNCHANGED', exactOwnedTree: 'UNKNOWN_CHILD_PID_NOT_RECORDED',
    outerInvocationsV2: 1, outerRetries: 0, browserLaunched: false,
    limitation: 'Transfer progressed to80percent before300s timeout; this does not establish CDN unavailable.' };
  const dest = `${base}/HEADLESS-SHELL-PROVISION-EXECUTION-v2.json`;
  fs.writeFileSync(dest, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({ report: pin(dest), sourcesMatched: sources.filter(x => x.match).length, sourceTotal: sources.length,
    filesMatched: files.filter(x => x.match).length, fileTotal: files.length, additionalMatched: additional.filter(x => x.match).length,
    additionalTotal: additional.length, evidence: report.evidence }));
} else throw new Error('Explicit readonly audit mode required');
