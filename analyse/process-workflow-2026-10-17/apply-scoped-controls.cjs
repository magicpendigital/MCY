const fs = require('node:fs');
function edit(file, transform) {
  const source = fs.readFileSync(file, 'utf8');
  const result = transform(source);
  if (source === result) throw Error(`No edit: ${file}`);
  fs.writeFileSync(file, result, 'utf8');
}
function insert(source, anchor, text) {
  if (source.split(anchor).length !== 2) throw Error('Anchor mismatch');
  const nl = source.includes('\r\n') ? '\r\n' : '\n';
  return source.replace(anchor, anchor + nl + nl + text);
}
edit('skills/mcy-change-review/SKILL.md', source => insert(source,
  "Use this skill for MCY feature work and handoff. Read the repository's `AGENTS.md`, the user's latest decision, the affected code/docs, and `git status` before choosing a gate. `AGENTS.md` holds runtime and authorization boundaries; source files and current configuration establish what actually exists. Dated analysis is evidence or a proposal, not a newer rule simply because it is detailed. The latest explicit user decision supersedes historical candidates.",
  'For every MCY task, follow the [task lifecycle](../../docs/quality/TASK_LIFECYCLE.md) and its intake/QC templates: record impact, working baseline, risk and mapped regression before implementation; freeze evidence, complete required independent QC and final/root verification before handoff. R0 can be brief. Existing authorizations and explicit user step boundaries persist; guidance does not enforce runtime or repository permissions.'));
edit('skills/mcy-change-review/references/review-matrix.md', source => {
  const before = '`npm run test:runtime`, then `npm run test:sites`; meaningful flow tests/manual QA for affected branches, device presets, viewport, keyboard and accessibility. Existing runtime tests cover fixtures only.';
  if (source.split(before).length !== 2) throw Error('R1 anchor mismatch');
  source = source.replace(before, '`npm run test:sites`; select meaningful affected Playwright cases (including protected runtime cases when impacted), flow/manual QA for changed and adjacent branches, device presets, viewport, keyboard and accessibility. Inspect current scripts/config before selecting a bounded regression set; a full unrelated UI suite is not required by default. These local tests cover fixtures only.');
  const start = source.indexOf('Current scripts are defined by `package.json`');
  const end = source.indexOf('The bundle check detects', start);
  if (start < 0 || end < 0) throw Error('Paragraph anchor mismatch');
  const nl = source.includes('\r\n') ? '\r\n' : '\n';
  return source.slice(0, start) + 'Current scripts are defined by `package.json`; inspect test source and Playwright config/testMatch rather than relying on dated suite counts. Map checks to the intake impact and preserved behavior in the [task lifecycle](../../../docs/quality/TASK_LIFECYCLE.md). `npm run test:runtime` currently invokes Playwright; use explicit affected file/case selection where appropriate and report that scope. A fixture pass does not establish authenticated live writes, role/RLS/media isolation, physical devices or complete English support. The GitHub workflow is not proven active until it runs on a PR and the repository rule requires it. A suite only counts as PASS after its process exits successfully in the relevant environment; if all test cases print `ok` but the runner hangs or must be interrupted, record the cases and runner status separately.' + nl + nl + source.slice(end);
});
edit('.github/pull_request_template.md', source => insert(source, '## Thay đổi và phạm vi',
  '- Intake trước sửa và QC cuối theo [task lifecycle](../docs/quality/TASK_LIFECYCLE.md): liên kết hồ sơ đã điền, baseline/impact map và regression được chọn; hash bản cuối, reviewer độc lập khi bắt buộc, xác minh cuối của root/người phụ trách và điểm dừng chờ người dùng. Không dùng mẫu trống làm bằng chứng.'));
console.log('Applied three scoped documentation/control edits, retaining other source bytes.');
