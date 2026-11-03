import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { buildCloseReceipt } from './responsive-runner-receipt-v4.mjs';

const dir = import.meta.dirname;
const output = path.join(dir, 'responsive-v4-close-control.json');
assert(!fs.existsSync(output), 'Preserve prior close-control evidence');

async function fakeChild(name, expectedExit, postPinError) {
  return await new Promise((resolve, reject) => {
    const args = ['-e', `process.exit(${expectedExit})`];
    const child = spawn(process.execPath, args, { cwd: dir, stdio: 'ignore' });
    let spawnError = null;
    child.on('error', error => { spawnError = String(error); });
    child.on('close', (exitCode, signal) => {
      try {
        const receipt = buildCloseReceipt({
          startedAt: 'fixture', endedAt: 'fixture', command: [process.execPath, ...args], cwd: dir,
          exitCode, signal, budgetExceeded: false, runnerBudgetMs: 900000, caseTimeoutMs: 45000,
          freezeSha256: 'fixture-freeze', sourceSha256: 'fixture-source', runnerSha256: 'fixture-runner',
          spawnError, verifyPostPins: () => { if (postPinError) throw Error('fixture post-pin read error'); },
        });
        resolve({ name, receipt });
      } catch (error) { reject(error); }
    });
  });
}

const controls = [
  await fakeChild('child-success', 0, false),
  await fakeChild('child-failure', 1, false),
  await fakeChild('post-pin-error', 0, true),
];
assert.deepEqual(controls.map(item => item.receipt.status), ['PASS', 'FAIL', 'FAIL']);
assert.deepEqual(controls.map(item => item.receipt.exitCode), [0, 1, 0]);
assert.deepEqual(controls.map(item => item.receipt.postPinsMatch), [true, true, false]);
assert(controls.every(item => item.receipt.sourceFreezeSha256 === 'fixture-source'));
assert.match(controls[2].receipt.postPinError, /fixture post-pin read error/);
fs.writeFileSync(output, JSON.stringify({ status: 'PASS', noBrowserOrServer: true, controls }, null, 2) + '\n', { flag: 'wx' });
console.log('close-control PASS 3/3: success, child failure, post-pin error');
