import * as fs from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, relative } from 'node:path';
const root = process.cwd(), base = 'analyse/ux-step5-3-2026-10-18';
const out = `${base}/headless-shell-provision-v3`, cache = resolve(root, '.vercel/ux-step5-3-browser-tools');
const pin = path => ({ path: relative(root, resolve(path)).replaceAll('\\', '/'), bytes: fs.statSync(path).size,
  sha256: createHash('sha256').update(fs.readFileSync(path)).digest('hex') });
const check = x => ({ ...pin(x.path), expected: x.sha256, match: pin(x.path).sha256 === x.sha256 });
const walk = path => fs.readdirSync(path, { withFileTypes: true }).flatMap(entry => entry.isDirectory()
  ? walk(resolve(path, entry.name)) : [pin(resolve(path, entry.name))]);
const old = JSON.parse(fs.readFileSync(`${base}/chromium-provision-v1/artifact-manifest.json`));
const v1 = JSON.parse(fs.readFileSync(`${base}/HEADLESS-SHELL-PROVISION-EXECUTION-v1.json`));
const sources = old.toolPins.map(check), existing = old.files.map(check), db = v1.newArtifacts.map(check);
const all = walk(cache).sort((a, b) => a.path.localeCompare(b.path));
const known = new Set([...old.files, ...v1.newArtifacts].map(x => x.path));
const added = all.filter(x => !known.has(x.path));
const manifest = { scope: 'PUBLIC_HEADLESS_SHELL_TOOL_ARTIFACTS_NO_BROWSER_LAUNCH', capturedAt: new Date().toISOString(),
  totalFileCount: all.length, totalBytes: all.reduce((n, x) => n + x.bytes, 0),
  newlyAddedFileCount: added.length, newlyAddedBytes: added.reduce((n, x) => n + x.bytes, 0),
  files: all, newlyAddedFiles: added, preserved318Pins: existing, preservedThreeDbPins: db, preservedSevenSourcePins: sources };
const manifestPath = `${out}/artifact-manifest.json`;
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
const report = { scope: 'V3_OFFICIAL_HEADLESS_SHELL_PROVISION_COMPLETE_HOLD_BROWSER', capturedAt: new Date().toISOString(),
  go: pin(`${base}/ROOT-HEADLESS-SHELL-PROVISION-GO-v3.json`), receipt: JSON.parse(fs.readFileSync(`${out}/receipt.json`)),
  cleanup: JSON.parse(fs.readFileSync(`${out}/cleanup-observation.json`)), artifactManifest: pin(manifestPath),
  sourceMatched: sources.filter(x => x.match).length, sourceTotal: sources.length,
  existing318Matched: existing.filter(x => x.match).length, existing318Total: existing.length,
  threeDbMatched: db.filter(x => x.match).length, threeDbTotal: db.length,
  newFileCount: added.length, newBytes: manifest.newlyAddedBytes,
  newExecutables: added.filter(x => x.path.endsWith('.exe')),
  evidence: ['started.json', 'receipt.json', 'stdout.log', 'stderr.log', 'cleanup-observation.json'].map(x => pin(`${out}/${x}`)),
  browserLaunched: false, sourceAppChanged: false, canonicalRebased: false, historicalFailuresPreserved: true };
const reportPath = `${base}/HEADLESS-SHELL-PROVISION-EXECUTION-v3.json`;
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ report: pin(reportPath), manifest: pin(manifestPath), sourcesMatched: report.sourceMatched,
  existing318Matched: report.existing318Matched, threeDbMatched: report.threeDbMatched,
  newFileCount: added.length, newBytes: report.newBytes, totalFiles: all.length, executables: report.newExecutables, evidence: report.evidence }));
