import { createHash } from 'node:crypto';
import { existsSync, openSync, closeSync, writeSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawn } from 'node:child_process';

const here = import.meta.dirname;
const root = resolve(here, '../..');
const freezePath = join(here, 'INTAKE-FREEZE-v3.json');
const logPath = join(here, 'baseline-capture-v3.log');
const receiptPath = join(here, 'baseline-capture-v3-command.json');
const sha = file => createHash('sha256').update(readFileSync(file)).digest('hex');
if (existsSync(logPath) || existsSync(receiptPath)) throw Error('Baseline v3 command output exists; never overwrite');
const freeze = JSON.parse(readFileSync(freezePath, 'utf8'));
for (const file of freeze.files) {
  if (sha(join(root, file.path)) !== file.sha256) throw Error('Baseline v3 input drift: ' + file.path);
}
if (freeze.accepted46SourceFreezeSha256 !== '01d45905ff401b6e127bac0bbafff03d3c66934e064f0711fcaf10deddb8db45') {
  throw Error('Unexpected accepted source freeze');
}
const helper = join(here, 'capture-visual-baseline-v3.mjs');
const startedAt = new Date().toISOString();
const fd = openSync(logPath, 'wx');
const child = spawn(process.execPath, [helper], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
let budgetExceeded = false;
let spawnError = null;
const timer = setTimeout(() => { budgetExceeded = true; child.kill(); }, 240000);
for (const stream of [child.stdout, child.stderr]) {
  stream.on('data', chunk => { writeSync(fd, chunk); process.stdout.write(chunk); });
}
child.on('error', error => { spawnError = String(error); writeSync(fd, spawnError + '\n'); });
child.on('close', (exitCode, signal) => {
  clearTimeout(timer);
  closeSync(fd);
  let postPinsMatch = true;
  for (const file of freeze.files) {
    if (sha(join(root, file.path)) !== file.sha256) postPinsMatch = false;
  }
  const receipt = { startedAt, endedAt: new Date().toISOString(),
    command: ['node', helper], cwd: root, exitCode, signal, budgetExceeded,
    runnerBudgetMs: 240000, freezeSha256: sha(freezePath), helperSha256: sha(helper),
    postPinsMatch, spawnError, status: exitCode === 0 && !budgetExceeded && postPinsMatch && !spawnError ? 'PASS_CAPTURE_ONLY' : 'FAIL',
    limit: 'Read-only local baseline capture, not 4.7 app acceptance; child browser cleanup on forced budget stop unverified.',
  };
  writeFileSync(receiptPath, JSON.stringify(receipt, null, 2) + '\n', { flag: 'wx' });
  console.log(JSON.stringify(receipt));
  process.exitCode = receipt.status === 'PASS_CAPTURE_ONLY' ? 0 : 1;
});
