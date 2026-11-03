import * as fs from 'node:fs';
import { createHash } from 'node:crypto';
const base = 'analyse/ux-step5-3-2026-10-18';
const pin = path => ({ path, bytes: fs.statSync(path).size,
  sha256: createHash('sha256').update(fs.readFileSync(path)).digest('hex') });
const check = x => ({ ...pin(x.path), expected: x.sha256, match: pin(x.path).sha256 === x.sha256 });
const previous = JSON.parse(fs.readFileSync(`${base}/CHROMIUM-TOOLING-EXECUTION-v1.json`));
const tools = JSON.parse(fs.readFileSync(`${base}/headless-shell-provision-v3/artifact-manifest.json`));
const sources = previous.reviewedSourcePins.map(check), client = previous.clientArtifactPins.map(check), toolFiles = tools.files.map(check);
const postPath = `${base}/HEADLESS-SUITES-POST-PINS-v1.json`;
const post = { capturedAt: new Date().toISOString(), sourcePins: sources, clientArtifactPins: client, toolArtifactPins: toolFiles,
  sourceMatched: sources.filter(x => x.match).length, clientMatched: client.filter(x => x.match).length,
  toolsMatched: toolFiles.filter(x => x.match).length, noAppSourceChange: true, canonicalNotRebased: true };
fs.writeFileSync(postPath, `${JSON.stringify(post, null, 2)}\n`);
const results = [];
for (const item of [
  { id: '1792349197869-11504', prefix: 'HEADLESS-UI-v1', output: 'MOCK-UI-EXECUTION-v5.json', tests: 15, expectedProcess: 'PASS_PROCESS' },
  { id: '1792349257150-31992', prefix: 'HEADLESS-MAPPED-v2', output: 'MAPPED-REGRESSIONS-EXECUTION-v2.json', tests: 12, expectedProcess: 'FAIL_PROCESS' },
]) {
  const invocation = `.vercel/ux-step5-3-20261018-v1/test-results/unit-review-invocations/${item.id}`;
  const evidence = [];
  for (const suffix of ['.json', '.stdout.log', '.stderr.log']) {
    const dest = `${base}/${item.prefix}${suffix}`;
    fs.copyFileSync(`${invocation}${suffix}`, dest); evidence.push(pin(dest));
  }
  const receipt = JSON.parse(fs.readFileSync(`${invocation}.json`));
  const stdout = fs.readFileSync(`${invocation}.stdout.log`, 'utf8');
  if (!stdout.includes(`${item.tests} passed`) || receipt.status !== item.expectedProcess)
    throw new Error('Evidence differs from reviewed actual output');
  const proxyPath = `${base}/${item.prefix}-egress.json`;
  const proxy = JSON.parse(fs.readFileSync(proxyPath)); evidence.push(pin(proxyPath));
  const report = { scope: 'LOCAL_CODE_FICTIONAL_FIXTURE_QA_ONLY', runId: item.id, channel: 'DEFAULT_HEADLESS_SHELL_NO_CHANNEL_OVERRIDE',
    startedAt: receipt.startedAt, endedAt: receipt.endedAt, assertions: { total: item.tests, passed: item.tests, failed: 0, skipped: 0 },
    processStatus: receipt.status, exitCode: receipt.exitCode, proxy, cleanup: receipt.cleanup,
    timedOut: receipt.timedOut, outputCapExceeded: receipt.outputCapExceeded,
    mappedComposition: item.tests === 12 ? '11_UNCHANGED_BROWSER_PLUS_1_EQUIVALENT_NODE_CATALOG_CONTRACT' : null,
    postPins: pin(postPath), evidence, automaticRetry: false, historicalFailuresPreserved: true,
    currentCanonicalGate: 'CURRENT_CANONICAL_REBIND_BLOCKED_7_OF_71_CHANGED',
    humanReviewOrProductApproval: false, rejectedRequestOrigin: proxy.unexpected ? 'UNKNOWN_NO_RAW_TARGET_EXPORT' : null };
  const dest = `${base}/${item.output}`;
  if (fs.existsSync(dest)) throw new Error('Preserve existing execution receipt');
  fs.writeFileSync(dest, `${JSON.stringify(report, null, 2)}\n`); results.push({ report: pin(dest), evidence });
}
console.log(JSON.stringify({ postPins: pin(postPath), sourceMatched: post.sourceMatched, sourceTotal: sources.length,
  clientMatched: post.clientMatched, clientTotal: client.length, toolMatched: post.toolsMatched, toolTotal: toolFiles.length, results }));
