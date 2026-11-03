import fs from 'node:fs';import path from 'node:path';import {createHash} from 'node:crypto';import assert from 'node:assert/strict';
const dir=path.resolve('analyse/ux-step4-1-2026-10-14');
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const freeze=JSON.parse(fs.readFileSync(path.join(dir,'source-freeze.json')));
const home=JSON.parse(fs.readFileSync(path.join(dir,'home-results.json'))),ui=JSON.parse(fs.readFileSync(path.join(dir,'ui-results.json')));
assert.equal(home.stats.unexpected,0);assert.equal(ui.stats.unexpected,0);assert.equal(ui.stats.expected,82);
const groups={};function walk(suites){for(const s of suites){for(const spec of s.specs??[])groups[s.file]=(groups[s.file]??0)+spec.tests.length;walk(s.suites??[]);}}walk(ui.suites);
const screenshots=['360','390','desktop','iphone','pixel'].map(label=>({path:`home-${label}.png`,sha256:sha(path.join(dir,`home-${label}.png`))}));
const artifacts=['dist/client/index.html','dist/server/index.js','dist/.openai/hosting.json','.openai/hosting.json'].map(rel=>({path:rel,sha256:sha(path.join(freeze.candidate,rel))}));
const evidence={...freeze,recordedAt:new Date().toISOString(),status:'LOCAL_IMPLEMENTATION_COMPLETE_AWAITING_INDEPENDENT_QC_AND_ROOT_INSPECTION',checks:[
 {command:'npm run build',cwd:freeze.candidate,exitCode:0,result:'PASS: runtime28, catalogue0, TypeScript, Vite601 modules and Sites preparation'},
 {command:'node scripts/check-client-bundle-secrets.mjs',cwd:freeze.candidate,exitCode:0,result:'PASS23 client text files'},
 {command:'node --test tests/sites-worker.test.mjs tests/playwright-test-environment.test.mjs',cwd:freeze.candidate,exitCode:0,result:'PASS5: Sites4+isolation1'},
 {command:'node node_modules/@playwright/test/cli.js test --config analyse/ux-step4-1-2026-10-14/qa.playwright.config.mjs ux-home.spec.ts',cwd:process.cwd(),exitCode:0,result:'PASS9',report:'home-results.json',sha256:sha(path.join(dir,'home-results.json')),stats:home.stats},
 {command:'node node_modules/@playwright/test/cli.js test --config analyse/ux-step4-1-2026-10-14/qa.playwright.config.mjs learner-ux.spec.ts ux-save-feedback.spec.ts ux-journey-selection.spec.ts mobile-runtime.spec.ts practice-flow.spec.ts --grep-invert "reviewed plan and explicit start/reflection|multimodal draft"',cwd:process.cwd(),exitCode:0,result:'PASS82',groups,report:'ui-results.json',sha256:sha(path.join(dir,'ui-results.json')),stats:ui.stats}
 ],screenshots,artifacts,excludedTests:'Three existing practice screenshot exporters write legacy evidence paths; excluded, no frozen screenshot overwrite. Existing final167 is prior-candidate evidence only.',intermediateFailures:[
 'Preparation initial guard incorrectly matched protected public/assets/android; partial byte-identical copy verified and resumed; actual preparation succeeded230. No native source copied.',
 'Initial Edge sandbox launch failed6 cases before app access; report ui-results.sandbox-launch-failure.json. Scoped escalated local browser execution succeeded.',
 'Focused test header/footer, transition and route selectors corrected; failed reports retained with named suffixes. No app source fix from these selector failures.',
 'Regression initial83 run deliberately interrupted before legacy screenshot exporter after finding a third exporter; partial report retained. Final82 exited0.'
 ],effects:{integration:false,backend:false,native:false,install:false,email:false,aiInference:false,deploy:false,rootAppEdit:false}};
fs.writeFileSync(path.join(dir,'evidence.json'),JSON.stringify(evidence,null,2)+'\n');console.log(JSON.stringify({groups,home:home.stats.expected,regressions:ui.stats.expected}));
