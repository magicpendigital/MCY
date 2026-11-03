import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const teamId = 'team_BGXDJYYYe7LSDoGDjWRBFlJH', projectId = 'prj_gTioLZWajGyQMkaPS1qapwoBOUnA';
const cli = 'C:/Users/Admin/AppData/Local/npm-cache/_npx/67eb4586ca667318/node_modules/vercel/dist/vc.js';
function get(endpoint) {
  const out = execFileSync(process.execPath, [cli, 'api', endpoint + '?teamId=' + teamId, '--method', 'GET', '--raw', '--scope', teamId], { encoding: 'utf8', timeout: 30000, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
  return JSON.parse(out);
}
const project = get('/v9/projects/' + projectId), domain = get('/v9/projects/' + projectId + '/domains/motchutyoga.magicpendigital.com');
const deployment = get('/v13/deployments/motchutyoga.magicpendigital.com');
assert.equal(project.id, projectId); assert.equal(project.accountId, teamId);
assert.equal(domain.projectId, projectId); assert.equal(domain.gitBranch, 'codex-mcy-p1-preview'); assert.equal(domain.verified, true);
assert.equal(deployment.project.id, projectId); assert.equal(deployment.team.id, teamId); assert.equal(deployment.readyState, 'READY');
assert.notEqual(deployment.target, 'production'); assert.equal(deployment.id, 'dpl_2zYC7QQJKMRLGsKgWPpWQqnPkaT4');
const r = { kind: 'NativeLateSaveHostingReadOnlyBaseline', capturedAt: new Date().toISOString(), projectId, teamId,
  domain: domain.name, branch: domain.gitBranch, verified: domain.verified, deploymentId: deployment.id, deploymentUrl: deployment.url,
  deploymentTarget: deployment.target, deploymentPublic: deployment.public, ssoProtectionMode: project.ssoProtection?.deploymentType ?? null,
  retainedArtifactSha256: deployment.meta?.mcyArtifactSha256 ?? null, mcpInspectionStatus: '403_SCOPE_FORBIDDEN', cliInspectionStatus: 'PASS',
  credentialsOrEnvValuesExported: false, mutations: 0, freshDriftAndProtectionCheckRequiredBeforeRelease: true };
fs.writeFileSync('analyse/MCY_NATIVE_LATE_SAVE_HOSTING_BASELINE_2026-10-14.json', JSON.stringify(r, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify(r));
