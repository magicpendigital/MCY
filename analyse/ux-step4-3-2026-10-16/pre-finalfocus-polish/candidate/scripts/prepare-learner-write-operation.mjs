// Preparation and read-only official CLI verification only. Never applies SQL.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, readdirSync, lstatSync, realpathSync, existsSync } from 'node:fs';
import path from 'node:path';

const root = realpathSync('D:/Projects/MCY');
assert.equal(realpathSync('.'), root, 'Run only from the MCY root');
const target = { id: 'mcy-staging-learner-write', kind: 'staging', organizationId: 'rzbpjfrndhrtxagpgdre', projectRef: 'mhumbczqrzutdnraafhs' };
const version = '20261002120000';
const candidateHash = '439963a4be829f46661b72aad89267038033e0ce1401b404f8ef95ddd421785a';
const workdir = path.join(root, '.vercel/mcy-learner-write-20261011');
const cli = 'C:/Users/Admin/AppData/Local/Temp/mcy-rpc-fix-tools-442b31230cac41c8903f7b36b0e613d1/_npx/fcaf72be640e6e73/node_modules/@supabase/cli-windows-x64/bin/supabase.exe';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
function bytes(relative) {
  assert.ok(!path.isAbsolute(relative) && !relative.split(/[\\/]/).includes('..'));
  const absolute = path.join(root, relative);
  assert.ok(!lstatSync(absolute).isSymbolicLink());
  assert.ok(realpathSync(absolute).startsWith(root + path.sep));
  return readFileSync(absolute);
}
function ensureDirectory(directory) {
  if (!existsSync(directory)) mkdirSync(directory);
  assert.ok(!lstatSync(directory).isSymbolicLink());
  assert.equal(realpathSync(directory), directory);
}
function writeIdenticalOrNew(file, content) {
  if (existsSync(file)) {
    assert.ok(!lstatSync(file).isSymbolicLink());
    assert.equal(hash(readFileSync(file)), hash(content), 'Existing operation input differs');
  } else writeFileSync(file, content, { flag: 'wx' });
}
const ledgerPath = 'analyse/MCY_LEARNER_WRITE_LEDGER_2026-10-11.json';
const ledger = JSON.parse(bytes(ledgerPath));
assert.equal(ledger.projectRef, target.projectRef);
assert.equal(ledger.sharedAligned, 20); assert.equal(ledger.remoteOnly, 0); assert.equal(ledger.pending, 5);
assert.equal(ledger.entries.length, 25);
assert.equal(new Set(ledger.entries.map(e => e.version)).size, 25);
const actualNames = readdirSync(path.join(root, 'supabase/migrations')).filter(n => /^\d{14}_.+\.sql$/.test(n)).sort();
assert.deepEqual(actualNames, ledger.entries.map(e => path.basename(e.path)).sort());
for (const entry of ledger.entries) {
  assert.match(entry.path, /^supabase\/migrations\/\d{14}_[a-z0-9_]+\.sql$/);
  assert.equal(entry.version, path.basename(entry.path).slice(0, 14));
  assert.equal(hash(bytes(entry.path)), entry.sha256);
}
const candidate = ledger.entries.find(e => e.version === version);
assert.ok(candidate && !candidate.remoteApplied); assert.equal(candidate.sha256, candidateHash);
const selected = ledger.entries.filter(e => e.remoteApplied || e.version === version);
assert.equal(selected.length, 21);
ensureDirectory(path.join(root, '.vercel'));
ensureDirectory(workdir); ensureDirectory(path.join(workdir, 'supabase'));
ensureDirectory(path.join(workdir, 'supabase/migrations'));
writeIdenticalOrNew(path.join(workdir, 'supabase/config.toml'), Buffer.from('project_id = "mcy"\n'));
for (const entry of selected) writeIdenticalOrNew(path.join(workdir, entry.path), bytes(entry.path));
assert.deepEqual(readdirSync(path.join(workdir, 'supabase/migrations')).sort(), selected.map(e => path.basename(e.path)).sort());
const listArgs = ['migration', 'list', '--project-ref', target.projectRef, '--workdir', workdir, '--output-format', 'json'];
const result = spawnSync(cli, listArgs, { encoding: 'utf8', windowsHide: true, timeout: 60000, env: { ...process.env, SUPABASE_TELEMETRY_DISABLED: 'true', DO_NOT_TRACK: '1' } });
assert.ok(!result.error && result.status === 0, 'Read-only official ledger failed; output withheld');
const match = result.stdout.match(/\{"migrations":.*\}/s);
assert.ok(match, 'Official CLI JSON missing');
const remote = JSON.parse(match[0]).migrations;
assert.equal(remote.length, 21);
assert.deepEqual(remote.filter(e => e.remote).map(e => e.remote).sort(), selected.filter(e => e.remoteApplied).map(e => e.version).sort());
assert.deepEqual(remote.filter(e => !e.remote).map(e => e.local), [version]);
assert.ok(remote.every(e => e.local && (!e.remote || e.local === e.remote)));
const sourceInputs = [
  candidate.path, 'src/Prototype.tsx', 'src/backend/supabase.ts', 'src/backend/consentPersistence.ts', 'src/backend/learnerSession.ts',
  'tests/learner-write-clean-rehearsal.cjs', 'tests/learner-write-review.spec.ts', 'tests/checkin-consent-migration.test.mjs',
  'scripts/rehearse-learner-writes-docker.mjs', 'scripts/prepare-learner-write-operation.mjs',
  'docs/release/MCY_LEARNER_WRITE_STOP_2026-10-11.sql', 'docs/release/MCY_LEARNER_WRITE_RESUME_2026-10-11.sql',
];
const evidencePaths = [
  ledgerPath, 'analyse/MCY_LEARNER_WRITES_DOCKER_2026-10-11.json', 'analyse/MCY_AUTH_LEARNER_FINAL_REVIEW_2026-10-11.md',
  'analyse/MCY_LEARNER_WRITE_SELECTIVE_OPERATION_REVIEW_2026-10-11.md',
  'test-results/auth-email-final/results.json', 'analyse/MCY_AUTH_EMAIL_WEB_ARTIFACT_2026-10-11.json',
  'analyse/MCY_AUTH_EMAIL_HOSTED_2026-10-11.json',
];
const receipt = {
  kind: 'SelectiveStagingLearnerWriteOperationPreparation', schemaVersion: 1,
  releaseId: 'mcy-learner-write-20261011', capturedAt: new Date().toISOString(), target,
  status: 'PREPARED_AWAITING_OWNER_DECISION', releaseAuthorized: false, cloudMutationPerformed: false,
  source: { kind: 'workingTreeReviewedInputs', existingGitCheckoutDirty: true, generalReleaseCheckerCleared: false },
  candidate: { ...candidate }, allLocalMigrations: ledger.entries,
  isolatedWorkdir: '.vercel/mcy-learner-write-20261011', isolatedConfigSha256: hash(readFileSync(path.join(workdir, 'supabase/config.toml'))),
  isolatedInputs: selected.map(e => ({ path: e.path, sha256: e.sha256, remoteApplied: e.remoteApplied })),
  officialReadOnlyList: { exitCode: 0, aligned: 20, remoteOnly: 0, pending: [version], command: 'supabase ' + listArgs.join(' ') },
  proposedApplyArguments: ['migration', 'up', '--linked', '--include-all', '--project-ref', target.projectRef, '--workdir', workdir],
  includeAllReason: 'Only the candidate is pending in this isolated path; its timestamp precedes two already applied migrations.',
  sourceInputs: sourceInputs.map(p => ({ path: p, sha256: hash(bytes(p)) })),
  evidence: evidencePaths.map(p => ({ path: p, sha256: hash(bytes(p)) })),
  liveTestSideEffects: { onlyDisposableActors: ['LEARNER_A', 'LEARNER_B'], maxNewConsentEvents: 12, maxNewCheckins: 2,
    maxNewObservations: 1, fictionalPayloadOnly: true, appendOnlyEventsRemain: true, noCustomerAccountWrites: true },
  postApplyRequired: [
    'Verify current project/org and permissions immediately before execution; current SQL and official ledger must match baseline.',
    'Read back ledger21, exact SQL bodies, function owners/search_path/ACL, private USAGE and denied old/client helper paths.',
    'Verify Owner MD5/OID/ACL and AI-off/version1/model-unset unchanged.',
    'Reauthenticate distinct confirmed disposable identities; verify authority independently of helper labels; no grant/extension.',
    'Run bounded actor/current/stale/revoked-consent/retry/cross-user/anonymous/direct-table negative API matrix and stored-row readback.',
    'Observe bounded errors/logs and final counts. On failure stop new client writer; do not claim in-flight transactions cancelled.',
  ],
  excluded: ['Production', 'Other pending migrations', 'AI enablement/inference', 'Role grants/expiry extension', 'Owner AI config save', 'Storage/media/content approval', 'Auth email triggers'],
  ownerPacket: { path: 'analyse/MCY_LEARNER_WRITE_OPERATION_2026-10-11.md', sha256: hash(bytes('analyse/MCY_LEARNER_WRITE_OPERATION_2026-10-11.md')) },
};
writeFileSync('analyse/MCY_LEARNER_WRITE_OPERATION_2026-10-11.json', JSON.stringify(receipt, null, 2) + '\n');
console.log(JSON.stringify({ status: receipt.status, aligned: 20, pending: [version], applyExecuted: false }));
