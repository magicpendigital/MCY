import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, realpathSync } from 'node:fs';
import path from 'node:path';

export function verifyAuthEmailBodyManifest(workdir, manifest) {
  const expectedIds = ['confirmation','magic_link','invite','recovery','email_change','reauthentication','password_changed','email_changed','phone_changed','identity_linked','identity_unlinked','mfa_factor_enrolled','mfa_factor_unenrolled'];
  assert.deepEqual(manifest.scenarios.map(s => s.id).sort(), expectedIds.sort());
  const config = readFileSync(path.join(workdir, 'supabase/config.toml'), 'utf8');
  const blocks = [...config.matchAll(/^\[([^\]]+)\]\s*\n([\s\S]*?)(?=^\[|$(?![\s\S]))/gm)];
  const bodies = manifest.scenarios.map(s => {
    const kind = ['confirmation','magic_link','invite','recovery','email_change','reauthentication'].includes(s.id) ? 'template' : 'notification';
    assert.equal(s.kind, kind);
    assert.equal(s.contentPath, `./supabase/templates/${s.id}${kind === 'notification' ? '_notification' : ''}.html`);
    const block = blocks.find(b => b[1] === `auth.email.${kind}.${s.id}`);
    assert.ok(block, 'Missing exact template block');
    const line = block[2].match(/^content_path = ("[^\n]+")$/m);
    assert.ok(line, 'Missing exact body path');
    assert.equal(JSON.parse(line[1]), s.contentPath);
    const resolved = path.resolve(workdir, s.contentPath);
    assert.equal(realpathSync(resolved).toLowerCase(), resolved.toLowerCase(), 'Template symlink not allowed');
    const bytes = readFileSync(resolved);
    const sha256 = createHash('sha256').update(bytes).digest('hex');
    assert.equal(sha256, s.sha256, 'Isolated body differs from reviewed manifest');
    assert.equal(createHash('sha256').update(readFileSync(s.contentPath)).digest('hex'), s.sha256, 'Source body changed');
    return { id:s.id, path:s.contentPath, bytes:bytes.length, sha256 };
  });
  assert.equal([...config.matchAll(/^content_path\s*=/gm)].length, bodies.length, 'Unexpected body upload');
  return bodies;
}
