import assert from 'node:assert/strict';
import {existsSync, readdirSync, readFileSync, statSync} from 'node:fs';
import path from 'node:path';
import test from 'node:test';

// Guards the browser baseline in docs/quality/KNOWN_INCIDENTS.md (INC-001): the learner app must not crash on iOS 15.0.
// Vite does not polyfill and does not reject regex lookbehind, so these static checks are the safety net.
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const walk = (dir, accept) => readdirSync(dir).flatMap(name => {
  const full = path.join(dir, name);
  return statSync(full).isDirectory() ? walk(full, accept) : accept(full) ? [full] : [];
});
const rel = file => path.relative(root, file).replaceAll('\\', '/');
const source = walk(path.join(root, 'src'), f => /\.(ts|tsx)$/.test(f) && !/\.d\.ts$/.test(f) && !rel(f).startsWith('src/compat/'));
const styles = walk(path.join(root, 'src'), f => f.endsWith('.css'));
// Comments may mention these APIs; strip them before scanning.
const code = file => readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

// API -> first Safari that has it. Use src/compat helpers (or a feature check) instead of the raw call.
const rawApis = [
  [/crypto\.randomUUID\s*\(/, 'crypto.randomUUID (Safari 15.4): use newId() from src/compat'],
  [/\.at\(\s*-?\d/, 'Array/String .at() (Safari 15.4): use lastOf() from src/compat or index arithmetic'],
  [/AbortSignal\.timeout\s*\(/, 'AbortSignal.timeout (Safari 16.0): use timeoutSignal() from src/compat'],
  [/\bstructuredClone\s*\(/, 'structuredClone (Safari 15.4)'],
  [/Object\.hasOwn\s*\(/, 'Object.hasOwn (Safari 15.4): use Object.prototype.hasOwnProperty.call'],
  [/\.findLast(Index)?\s*\(/, 'findLast/findLastIndex (Safari 15.4)'],
  [/\.(toSorted|toReversed|toSpliced)\s*\(/, 'toSorted/toReversed/toSpliced (Safari 16)'],
  [/Array\.fromAsync|Promise\.withResolvers|Object\.groupBy|Map\.groupBy/, 'newer Array/Promise/Object statics (Safari 16.4-17.4)'],
  [/Intl\.Segmenter/, 'Intl.Segmenter (Safari 16.4)'],
  [/\.(isWellFormed|toWellFormed)\s*\(/, 'String.isWellFormed (Safari 16.4)'],
];
// Syntax that Vite will not lower: a single occurrence stops the whole chunk from parsing on older Safari.
const syntax = [
  [/\(\?<[=!]/, 'regex lookbehind (Safari 16.4): rewrite without lookbehind'],
  [/\bstatic\s*\{/, 'class static block (Safari 16.1)'],
];

test('client source does not use APIs or syntax missing on iOS 15.0 outside src/compat', () => {
  const found = [];
  for (const file of source) {
    const text = code(file);
    for (const [pattern, message] of [...rawApis, ...syntax]) if (pattern.test(text)) found.push(`${rel(file)}: ${message}`);
  }
  assert.deepEqual(found, [], `Old-iPhone incident INC-001 (docs/quality/KNOWN_INCIDENTS.md):\n${found.join('\n')}`);
});

// Newer CSS is allowed only as progressive enhancement. The ratchet may go down, never up: raising it needs a reviewed
// fallback and an update to docs/quality/KNOWN_INCIDENTS.md.
const cssBudget = [
  [/[0-9]+(\.[0-9]+)?(dvh|svh|lvh|dvw|svw|lvw)\b/g, 'dvh/svh/lvh units (Safari 15.4)', 16],
  [/:has\(/g, ':has() (Safari 15.4)', 10],
  [/@container\b/g, '@container (Safari 16.0)', 3],
  [/container-type\s*:/g, 'container-type (Safari 16.0)', 1],
  [/color-mix\(/g, 'color-mix() (Safari 16.2)', 0],
  [/@layer\b/g, '@layer (Safari 15.4)', 0],
  [/animation-timeline|scroll-timeline|view-timeline/g, 'scroll-driven animation (not in Safari 15)', 0],
  [/\bsubgrid\b/g, 'subgrid (Safari 16)', 0],
  [/text-wrap\s*:/g, 'text-wrap (Safari 17.5)', 0],
];
test('newer CSS features do not grow beyond the reviewed budget', () => {
  const css = styles.map(f => readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')).join('\n');
  const over = [];
  for (const [pattern, label, budget] of cssBudget) {
    const count = (css.match(pattern) ?? []).length;
    if (count > budget) over.push(`${label}: ${count} uses, budget ${budget}`);
  }
  assert.deepEqual(over, [], `Add a fallback and update docs/quality/KNOWN_INCIDENTS.md before raising the budget:\n${over.join('\n')}`);
});

const dist = path.join(root, 'dist/client/assets');
test('built JavaScript has no regex lookbehind or class static block', { skip: !existsSync(dist) && 'dist/client/assets not built' }, () => {
  const found = [];
  for (const file of walk(dist, f => f.endsWith('.js'))) {
    const text = readFileSync(file, 'utf8');
    if (/\(\?<[=!]/.test(text)) found.push(`${rel(file)}: regex lookbehind`);
    if (/\bstatic\s*\{/.test(text)) found.push(`${rel(file)}: class static block`);
  }
  assert.deepEqual(found, [], 'The bundle would fail to parse on iOS 15 (INC-001).');
});

test('the baseline and incident register stay in the guidance files', () => {
  const agents = readFileSync(path.join(root, 'AGENTS.md'), 'utf8');
  const register = readFileSync(path.join(root, 'docs/quality/KNOWN_INCIDENTS.md'), 'utf8');
  assert.match(agents, /KNOWN_INCIDENTS\.md/);
  assert.match(register, /INC-001/);
  assert.match(readFileSync(path.join(root, 'vite.config.ts'), 'utf8'), /safari15/);
});
