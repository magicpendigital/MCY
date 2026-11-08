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
  [/[0-9]+(\.[0-9]+)?(cqi|cqw|cqh|cqb|cqmin|cqmax)\b/g, 'container query units cqi/cqw (Safari 16.0)', 7],
  [/:has\(/g, ':has() (Safari 15.4)', 10],
  [/@container\b/g, '@container (Safari 16.0)', 3],
  [/container-type\s*:/g, 'container-type (Safari 16.0)', 1],
  [/color-mix\(/g, 'color-mix() (Safari 16.2)', 0],
  [/(oklch|oklab|lch|lab|light-dark)\(/g, 'oklch/oklab/lab/light-dark colour functions (Safari 15.4-17.5)', 0],
  [/@layer\b/g, '@layer (Safari 15.4)', 0],
  [/@property\b/g, '@property (Safari 16.4)', 0],
  [/@starting-style|field-sizing|interpolate-size|anchor-name|position-anchor/g, 'newest CSS (Safari 17.5+)', 0],
  [/animation-timeline|scroll-timeline|view-timeline/g, 'scroll-driven animation (not in Safari 15)', 0],
  [/\bsubgrid\b/g, 'subgrid (Safari 16)', 0],
  [/text-wrap\s*:/g, 'text-wrap (Safari 17.5)', 0],
];
const stripComments = text => text.replace(/\/\*[\s\S]*?\*\//g, '');
const overBudget = css => cssBudget.flatMap(([pattern, label, budget]) => {
  const count = (css.match(pattern) ?? []).length;
  return count > budget ? [`${label}: ${count} uses, budget ${budget}`] : [];
});
test('newer CSS features do not grow beyond the reviewed budget', () => {
  const over = overBudget(styles.map(f => stripComments(readFileSync(f, 'utf8'))).join('\n'));
  assert.deepEqual(over, [], `Add a fallback and update docs/quality/KNOWN_INCIDENTS.md before raising the budget:\n${over.join('\n')}`);
});

// A declaration that uses a unit older Safari does not know is thrown away whole. So the same property needs an earlier
// declaration in the same rule that old Safari can read (for example `height: 100vh; height: 100dvh;`). The three protected
// runtime lines below keep `inset: 0` on the same rule; they need the Owner's authorisation to edit and stay listed until then.
const modernUnit = /[0-9]+(\.[0-9]+)?(dvh|svh|lvh|dvw|svw|lvw|cqi|cqw|cqh|cqb|cqmin|cqmax)\b/;
const fallbackExceptions = [
  { file: 'src/styles.css', value: '100dvh', reason: 'protected runtime file; the rule is position:fixed with inset:0, so the box still fills the screen on iOS < 15.4' },
];
test('every declaration with a newer viewport or container unit has an earlier fallback in the same rule', () => {
  const missing = [];
  for (const file of styles) {
    const name = rel(file);
    for (const block of stripComments(readFileSync(file, 'utf8')).matchAll(/([^{}]*)\{([^{}]*)\}/g)) {
      // A rule whose selector uses :has() is dropped whole on old Safari; it is budgeted above and its default state is the fallback.
      if (block[1].includes(':has(')) continue;
      const seen = [];
      for (const part of block[2].split(';')) {
        const at = part.indexOf(':');
        if (at < 1) continue;
        const prop = part.slice(0, at).trim().toLowerCase(), value = part.slice(at + 1).trim();
        if (modernUnit.test(value) && !seen.some(d => d.prop === prop && !modernUnit.test(d.value))
          && !fallbackExceptions.some(e => e.file === name && value.includes(e.value))) {
          missing.push(`${name}: ${block[1].trim().replace(/\s+/g, ' ').slice(0, 70)} { ${prop}: ${value.slice(0, 60)} }`);
        }
        seen.push({ prop, value });
      }
    }
  }
  assert.deepEqual(missing, [], `Old Safari drops these whole declarations (INC-001). Put a plain-unit declaration of the same property before each:\n${missing.join('\n')}`);
});

// The built bundle also contains dependencies, which the source scan cannot see. In CI and in the release gate
// (npm run check:ios15) a missing build is a failure, not a skip.
const dist = path.join(root, 'dist/client/assets');
const needDist = process.env.MCY_REQUIRE_DIST === '1';
const skipNoDist = !existsSync(dist) && !needDist && 'dist/client/assets not built';
test('the release gate has a built bundle to check', { skip: !needDist && 'only enforced when MCY_REQUIRE_DIST=1' }, () => {
  assert.ok(existsSync(dist), 'Run npm run build first: dist/client/assets is missing.');
});
test('built JavaScript has no regex lookbehind or class static block', { skip: skipNoDist }, () => {
  const found = [];
  for (const file of walk(dist, f => f.endsWith('.js'))) {
    const text = readFileSync(file, 'utf8');
    if (/\(\?<[=!]/.test(text)) found.push(`${rel(file)}: regex lookbehind`);
    if (/\bstatic\s*\{/.test(text)) found.push(`${rel(file)}: class static block`);
  }
  assert.deepEqual(found, [], 'The bundle would fail to parse on iOS 15 (INC-001).');
});
// Counts are exact for APIs that a dependency may feature-detect (one allowed, with the reason); everything else must be absent.
const bundleApis = [
  [/crypto\.randomUUID\s*\(/g, 'crypto.randomUUID (Safari 15.4)', 0],
  [/\.at\(\s*-?\d/g, '.at() (Safari 15.4)', 0],
  [/AbortSignal\.(timeout|any)\s*\(/g, 'AbortSignal.timeout/any (Safari 16/17.4)', 0],
  [/\bstructuredClone\s*\(/g, 'structuredClone (Safari 15.4)', 0],
  [/Object\.hasOwn\s*\(/g, 'Object.hasOwn (Safari 15.4)', 0],
  [/\.findLast(Index)?\s*\(/g, 'findLast (Safari 15.4)', 0],
  [/\.(toSorted|toReversed|toSpliced)\s*\(/g, 'toSorted/toReversed (Safari 16)', 0],
  [/Array\.fromAsync|Promise\.withResolvers|Object\.groupBy|Map\.groupBy|URL\.canParse/g, 'newer statics (Safari 16.4-17.4)', 0],
  [/Intl\.Segmenter|Intl\.DurationFormat|Temporal\./g, 'newer Intl/Temporal', 0],
  [/\.showModal\s*\(|\.requestClose\s*\(|startViewTransition/g, 'dialog/view transitions (Safari 15.4/18)', 0],
  [/\.checkVisibility\s*\(/g, 'checkVisibility (Safari 17.4): allowed once, behind a typeof check in the focus helper', 2],
];
test('built JavaScript does not call APIs missing on iOS 15.0 (dependencies included)', { skip: skipNoDist }, () => {
  const text = walk(dist, f => f.endsWith('.js')).map(f => readFileSync(f, 'utf8')).join('\n');
  const found = bundleApis.flatMap(([pattern, label, allowed]) => {
    const count = (text.match(pattern) ?? []).length;
    return count > allowed ? [`${label}: ${count} calls, allowed ${allowed}`] : [];
  });
  assert.deepEqual(found, [], `A new dependency or a source change brought an API that iOS 15.0 lacks (INC-001):\n${found.join('\n')}`);
});
test('built CSS stays inside the reviewed budget, dependencies included', { skip: skipNoDist }, () => {
  const over = overBudget(walk(dist, f => f.endsWith('.css')).map(f => stripComments(readFileSync(f, 'utf8'))).join('\n'));
  assert.deepEqual(over, [], `Add a fallback and update docs/quality/KNOWN_INCIDENTS.md before raising the budget:\n${over.join('\n')}`);
});

test('the baseline, the release gate and the incident register stay wired in', () => {
  const agents = readFileSync(path.join(root, 'AGENTS.md'), 'utf8');
  const register = readFileSync(path.join(root, 'docs/quality/KNOWN_INCIDENTS.md'), 'utf8');
  const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
  const workflow = readFileSync(path.join(root, '.github/workflows/quality.yml'), 'utf8');
  assert.match(agents, /KNOWN_INCIDENTS\.md/);
  assert.match(agents, /check:ios15/);
  assert.match(register, /INC-001/);
  assert.match(readFileSync(path.join(root, 'vite.config.ts'), 'utf8'), /safari15/);
  assert.match(pkg.scripts['check:ios15'] ?? '', /check-ios15/);
  assert.match(readFileSync(path.join(root, 'scripts/check-ios15.mjs'), 'utf8'), /MCY_REQUIRE_DIST/);
  // CI must run on the branch that actually ships, not only on pull requests to main.
  assert.match(workflow, /push:\s*\n\s*branches:\s*\[\s*'\*\*'\s*\]/);
  assert.match(workflow, /check:ios15|test:browser-compat/);
});
