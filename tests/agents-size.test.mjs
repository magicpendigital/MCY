import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';
import path from 'node:path';
import test from 'node:test';

// AGENTS.md is loaded into every Claude session, so it must stay small (hard gate 6 inside the file). When it grows, compact it:
// move dated status to docs/status/, keep durable rules and decisions. This test makes growth visible instead of silent.
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const agents = readFileSync(path.join(root, 'AGENTS.md'), 'utf8');
const HARD_LIMIT = 22 * 1024;

test(`AGENTS.md stays under ${HARD_LIMIT} bytes (compact it and archive history under docs/status/)`, () => {
  const size = Buffer.byteLength(agents);
  assert.ok(size <= HARD_LIMIT, `AGENTS.md is ${size} bytes. Apply hard gate 6: move dated status to docs/status/, merge duplicates, drop superseded rules; keep hard gates, current decisions, security boundaries, the current-state block and the runtime contract.`);
});
test('the compaction rule, the hard gates and the protected-runtime contract are still in AGENTS.md', () => {
  for (const marker of ['## Hard gates', 'Keep this file small', 'check:ios15', 'KNOWN_INCIDENTS.md', '## Product direction and scope', '## Security and data boundaries',
    '## Current state', '## Editing Boundary', '## Runtime Contract', '## Keyboard Rule', 'npm run check:runtime',
    '## Working loop', '## Commands', '## Zone map', 'PLAN.md', 'npm run check:quick', 'npm run test:unit']) assert.ok(agents.includes(marker), `AGENTS.md lost: ${marker}`);
});
test('the archived full log exists and is linked, so nothing was lost by compaction', () => {
  for (const moved of ['docs/runtime/RUNTIME_CONTRACT.md', 'docs/product/PRODUCT_DECISIONS.md', 'PLAN.md']) {
    assert.ok(existsSync(path.join(root, moved)), `missing ${moved}`);
    assert.ok(agents.includes(moved), `AGENTS.md must link ${moved}`);
  }
  assert.ok(existsSync(path.join(root, 'docs/status/AGENTS_FULL_LOG_2026-11-08.md')));
  assert.match(agents, /docs\/status\/AGENTS_FULL_LOG_2026-11-08\.md/);
});
