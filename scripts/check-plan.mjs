#!/usr/bin/env node
/**
 * Lightweight process check (copied by the mca `repo-bootstrap` skill). Plain Node, no dependencies.
 *
 *   node scripts/check-plan.mjs          → PLAN.md fresh + short, every plan made from plans/_TEMPLATE.md complete
 *   node scripts/check-plan.mjs <file>   → one plan only
 */
import fs from 'node:fs';
import path from 'node:path';

const MAX_AGE_DAYS = 14;
const MAX_LINES = 200;
const MARKER = '<!-- plan-template v1 -->';
const REQUIRED = ['Mục tiêu', 'Tiêu chí xong', 'Phạm vi sửa', 'Cố ý không đụng', 'Ảnh hưởng', 'Bảo mật', 'Hoàn tác', 'Cách thử', 'Lệnh kiểm', 'Rủi ro còn lại', 'Cần duyệt', 'Progress'];
const PLACEHOLDER = /\{\{[^}]*\}\}/;

const root = process.cwd();
const rel = (f) => path.relative(root, f).split(path.sep).join('/');

function checkStatusBoard(now) {
  const file = path.join(root, 'PLAN.md');
  if (!fs.existsSync(file)) return ['PLAN.md: thiếu (bảng tiến độ sống ở gốc repo)'];
  const text = fs.readFileSync(file, 'utf8');
  const errors = [];
  if (PLACEHOLDER.test(text)) errors.push('PLAN.md: còn chỗ trống {{...}}');
  const lines = text.split(/\r?\n/).length;
  if (lines > MAX_LINES) errors.push(`PLAN.md: ${lines} dòng, quá ${MAX_LINES} — xoá việc đã xong quá 2 tuần`);
  const m = text.match(/Cập nhật lần cuối:\**\s*(\d{4})-(\d{2})-(\d{2})/);
  const date = m ? new Date(`${m[1]}-${m[2]}-${m[3]}T00:00:00Z`) : null;
  if (!date || Number.isNaN(date.getTime())) errors.push('PLAN.md: thiếu dòng "Cập nhật lần cuối: YYYY-MM-DD"');
  else {
    const age = (now.getTime() - date.getTime()) / 86_400_000;
    if (age > MAX_AGE_DAYS) errors.push(`PLAN.md: cập nhật lần cuối ${Math.floor(age)} ngày trước, quá ${MAX_AGE_DAYS} ngày`);
    if (age < -1) errors.push('PLAN.md: ngày cập nhật ở tương lai');
  }
  return errors;
}

/** null = not made from the template (skipped) */
function checkPlan(file) {
  const text = fs.readFileSync(file, 'utf8');
  if (!text.startsWith(MARKER)) return null;
  const name = rel(file);
  const errors = [];
  if (PLACEHOLDER.test(text)) errors.push(`${name}: còn chỗ trống {{...}}`);
  const headings = [...text.matchAll(/^#{2,3}\s+(?:\d+\.\s*)?(.+?)\s*$/gm)].map((x) => x[1]);
  for (const h of REQUIRED) if (!headings.some((x) => x.startsWith(h))) errors.push(`${name}: thiếu mục "${h}"`);
  const risks = text.match(/^##\s+(?:\d+\.\s*)?Rủi ro còn lại[^\n]*\n([\s\S]*?)(?=^##\s|$(?![\s\S]))/m)?.[1] ?? '';
  if (/^\s*-\s*\[CAO\]/im.test(risks)) errors.push(`${name}: còn rủi ro [CAO] chưa xử lý — dừng và hỏi người duyệt`);
  return errors;
}

function run(only) {
  if (only) {
    const file = path.resolve(root, only);
    if (!fs.existsSync(file)) return [`${only}: không có file này`];
    return checkPlan(file) ?? [`${rel(file)}: không có dòng đánh dấu mẫu (${MARKER}) ở đầu file`];
  }
  const errors = checkStatusBoard(new Date());
  for (const folder of ['active', 'done', 'backlog']) {
    const dir = path.join(root, 'plans', folder);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir).filter((n) => n.endsWith('.md') && !n.startsWith('_')).sort()) errors.push(...(checkPlan(path.join(dir, f)) ?? []));
  }
  return errors;
}

const errors = run(process.argv[2]);
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else console.log('Kiểm kế hoạch: đạt.');
