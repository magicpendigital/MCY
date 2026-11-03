// Root-authorized SOURCE ONLY preparation. Does not build, launch or test.
import { createHash } from 'node:crypto';
import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
const tree = 'C:/Users/Admin/.codex/worktrees/pilot-web-android-20261021/MCY';
const evidence = 'D:/Projects/MCY/analyse/pilot-release-2026-10-21';
const overlay = path.join(tree, '.vercel/critical-fixtures-v2-source');
const sha = b => createHash('sha256').update(b).digest('hex');
const pin = p => ({ path: p, sha256: sha(readFileSync(p)), bytes: lstatSync(p).size });
if (existsSync(overlay)) throw new Error('Do not replace an existing QA overlay');
if (lstatSync(tree).isSymbolicLink() || !path.resolve(overlay).startsWith(path.resolve(tree) + path.sep)) throw new Error('Containment');
const source = JSON.parse(readFileSync(path.join(evidence, 'SOURCE-FREEZE-v2.json')));
for (const p of source.allKnownCandidateFiles) if (sha(readFileSync(path.join(tree,p.relativePath)))!==p.sha256) throw new Error('Source changed');
const selected=['tests/ux-save-feedback.spec.ts','tests/learner-device-acceptance.spec.ts','tests/auth-callback.spec.ts'];
const closure=[...selected,'src/backend/learnerData.ts','src/backend/authRouting.ts','src/backend/database.types.ts','src/bodyRegions.ts'];
const copies=[];
mkdirSync(overlay,{recursive:true});
for(const relativePath of closure){
 const input=path.join(tree,relativePath); const before=readFileSync(input); let after=before;
 const replaceOnce=(oldText,newText)=>{ const text=after.toString('utf8'); if(text.split(oldText).length!==2) throw new Error('Exact assertion preimage required'); after=Buffer.from(text.replace(oldText,newText)); };
 if(relativePath==='tests/learner-device-acceptance.spec.ts') replaceOnce("  await expect(page.locator('.mcy-account-home h1')).toHaveText('Chào, '+name+'.');\n  await expect(page.getByRole('button',{name:'Đăng xuất thiết bị này',exact:true})).toBeEnabled();", "  const current=page.getByTestId('flow-current');\n  await expect(current).toHaveCount(1);\n  const profile=current.locator(':scope > [data-flow-route=\"profile\"][data-flow-active=\"true\"]');\n  await expect(profile).toHaveCount(1);\n  await expect(profile).toBeVisible();\n  await expect(profile).not.toHaveAttribute('inert');\n  await expect(profile).not.toHaveAttribute('aria-hidden','true');\n  const heading=profile.locator('.mcy-account-home h1');\n  await expect(heading).toHaveCount(1);\n  await expect(heading).toBeVisible();\n  await expect(heading).toHaveText('Chào, '+name+'.');\n  await expect(profile.getByRole('button',{name:'Đăng xuất thiết bị này',exact:true})).toBeEnabled();");
 if(relativePath==='tests/ux-save-feedback.spec.ts'){
  replaceOnce("  await expect(active(page)).toContainText('Email đã xác minh.');", "  await expect(active(page)).toContainText('fixture@example.test');");
  replaceOnce("  await expect(active(page)).toContainText('Hồ sơ và Hành trình được giữ riêng theo từng tài khoản.');", "  await expect(active(page)).toContainText('Hồ sơ và Hành trình được giữ riêng theo từng tài khoản.');\n  await expect(active(page)).toContainText('fixture@example.test · đã xác minh');");
 }
 const output=path.join(overlay,relativePath); mkdirSync(path.dirname(output),{recursive:true});writeFileSync(output,after,{flag:'wx'});
 copies.push({relativePath, original:pin(input), copied:pin(output), changed:sha(before)!==sha(after)});
}
let proxy=readFileSync(path.join(tree,'scripts/unit-review-egress-guard.mjs'),'utf8');
proxy=proxy.replace("const counts = { forwarded:","const connectCategories = { loopbackExpected: 0, invalidBackend: 0, other: 0 };\n  const counts = { forwarded:");
proxy=proxy.replace("server.on('connect', (_request, socket) => { withinCap(); counts.deniedConnect++;", "server.on('connect', (_request, socket) => {\n    let category='other';\n    try { const authority=new URL('http://' + _request.url); if(authority.hostname==='127.0.0.1' && authority.port===target.port) category='loopbackExpected'; else if(authority.hostname==='mcy-playwright.invalid') category='invalidBackend'; } catch {}\n    connectCategories[category]++;\n    withinCap(); counts.deniedConnect++;");
proxy=proxy.replace('counts, unexpected, status:', 'counts, connectCategories, unexpected, status:');
const proxyPath=path.join(evidence,'critical-egress-guard-v2.mjs'); writeFileSync(proxyPath,proxy,{flag:'wx'});
const browserRoot='D:/Projects/MCY/.vercel/ux-step5-3-browser-tools/chromium_headless_shell-1228';
const browserPins=[]; function walk(dir){for(const item of readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,item.name);if(lstatSync(p).isSymbolicLink())throw new Error('Browser link');if(item.isDirectory())walk(p);else if(item.name!=='debug.log')browserPins.push(pin(p));}}walk(browserRoot);
const result={schema:'mcy.critical-fixtures-overlay.v2',scope:'SOURCE_ONLY_NOT_INVOKED',overlay,copies,originalSelectedTestsUnchanged:true,importClosure:'Only relative imports are learnerData→database.types/bodyRegions (type-only); authRouting no imports; external packages resolve managedtree exact node_modules.',assertionAmendments:2,source479Preserved:true,proxyOriginal:pin(path.join(tree,'scripts/unit-review-egress-guard.mjs')),proxyCopy:pin(proxyPath),connectPolicy:'ALL_CONNECT_STILL_DENIED_AND_UNEXPECTED; finite categories only; no destinations/headers/bodies recorded',browserRoot,browserPins,browserRuntimeLogExcluded:'debug.log only; existing log never read',priorFailure:{receipt:pin(path.join(evidence,'CRITICAL-FIXTURES-v1.json')),cause:'UNKNOWN_220_DENIED_CONNECT_NO_DESTINATIONS',tests:'29/31 PASS; 2 stale assertions; v1 FAIL immutable'},noBuildTestBrowserProviderDeviceActions:0};
writeFileSync(path.join(evidence,'CRITICAL-FIXTURES-OVERLAY-v2.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({overlay,copiedFiles:copies.length,changedFiles:copies.filter(x=>x.changed).length,browserPins:browserPins.length}));
