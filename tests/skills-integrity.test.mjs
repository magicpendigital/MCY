import assert from 'node:assert/strict';
import {existsSync, readdirSync, readFileSync, statSync} from 'node:fs';
import path from 'node:path';
import test from 'node:test';

// The repository skills only help if Claude can load them and they stay consistent. Claude loads project skills from
// .claude/skills/<name>/SKILL.md; the older top-level skills/ folder was never discovered (2026-11-08).
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const skillsDir = path.join(root, '.claude/skills');
const names = readdirSync(skillsDir).filter(n => statSync(path.join(skillsDir, n)).isDirectory());
const read = file => readFileSync(file, 'utf8');
const walk = dir => readdirSync(dir).flatMap(n => { const f = path.join(dir, n); return statSync(f).isDirectory() ? walk(f) : [f]; });

test('the core MCY skills exist in the folder Claude loads', () => {
  for (const required of ['mcy-change-review', 'mcy-brand-ux', 'mcy-release-sync', 'mcy-ios-compat', 'mcy-supabase-rollout']) assert.ok(names.includes(required), `missing .claude/skills/${required}`);
});
test('each skill has matching frontmatter and a useful description', () => {
  for (const name of names) {
    const text = read(path.join(skillsDir, name, 'SKILL.md'));
    const front = text.match(/^---\r?\nname:\s*(.+)\r?\ndescription:\s*(.+)\r?\n---/);
    assert.ok(front, `${name}: frontmatter must be name then description`);
    assert.equal(front[1].trim(), name, `${name}: name must equal the folder name`);
    assert.ok(front[2].length > 80 && front[2].length < 700, `${name}: description should say what it does and when to use it`);
  }
});
test('relative links inside skills resolve', () => {
  const broken = [];
  for (const file of walk(skillsDir).filter(f => f.endsWith('.md'))) {
    for (const m of read(file).matchAll(/\]\((\.\.?\/[^)#]+)(#[^)]*)?\)/g)) {
      if (!existsSync(path.resolve(path.dirname(file), m[1]))) broken.push(`${path.relative(root, file)} -> ${m[1]}`);
    }
  }
  assert.deepEqual(broken, []);
});
test('AGENTS.md names every skill and no live guidance points at the old skills/ folder', () => {
  const agents = read(path.join(root, 'AGENTS.md'));
  for (const name of names) assert.ok(agents.includes(name), `AGENTS.md should mention ${name}`);
  for (const file of ['AGENTS.md', '.github/pull_request_template.md', 'docs/quality/TASK_LIFECYCLE.md', 'docs/release/CROSS_PLATFORM_RELEASE.md', 'docs/release/release-profile.json']) {
    assert.ok(!/(^|[^.\w/])skills\/mcy-/.test(read(path.join(root, file)).replace(/\.claude\/skills\/mcy-/g, '')), `${file} still references skills/mcy-*`);
  }
});
