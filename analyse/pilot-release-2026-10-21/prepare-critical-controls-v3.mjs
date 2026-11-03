// SOURCE ONLY amendment after v2 immutable failure. No invocation.
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync,lstatSync} from 'node:fs';
import path from 'node:path';
const e='D:/Projects/MCY/analyse/pilot-release-2026-10-21';
const t='C:/Users/Admin/.codex/worktrees/pilot-web-android-20261021/MCY';
const sha=b=>createHash('sha256').update(b).digest('hex');
const pin=p=>({path:p,sha256:sha(readFileSync(p)),bytes:lstatSync(p).size});
const output=(n,s)=>writeFileSync(path.join(e,n),s,{flag:'wx'});
let setup=readFileSync(path.join(e,'critical-fixtures-setup-v1.mjs'),'utf8');
setup=setup.replace("'file:///C:/Users/Admin/.codex/worktrees/pilot-web-android-20261021/MCY/scripts/unit-review-egress-guard.mjs'","'./critical-egress-guard-v2.mjs'").replaceAll('critical-fixtures-v1','critical-fixtures-v3').replaceAll('4290','4294').replaceAll('4291','4295');
setup=setup.replace('port: 4294, strictPort: true, hmr: false,',`port: 4294, strictPort: true, hmr: false, ws: false, watch: null, cors: false, forwardConsole: false,
        preTransformRequests: false, warmup: { clientFiles: [], ssrFiles: [] },
        headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff',
          'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; media-src 'self'; connect-src http://127.0.0.1:4294 https://mcy-playwright.invalid; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'" },`);
output('critical-fixtures-setup-v3.mjs',setup);
let config=readFileSync(path.join(e,'critical-fixtures.playwright-v2.mjs'),'utf8').replaceAll('critical-fixtures-v2/results','critical-fixtures-v3/results').replaceAll('CRITICAL-FIXTURES-v2.report.json','CRITICAL-FIXTURES-v3.report.json').replaceAll('critical-fixtures-setup-v2.mjs','critical-fixtures-setup-v3.mjs').replaceAll('4292','4294').replaceAll('4293','4295');
output('critical-fixtures.playwright-v3.mjs',config);
const control=JSON.parse(readFileSync(path.join(e,'CRITICAL-FIXTURES-INPUTS-v2.json')));
control.schema='mcy.critical-fixtures-inputs.v3';
control.controls=['critical-fixtures.playwright-v3.mjs','critical-fixtures-setup-v3.mjs','critical-egress-guard-v2.mjs','CRITICAL-FIXTURES-OVERLAY-v2.json'].map(n=>pin(path.join(e,n)));
control.toolPins.push(pin(path.join(t,'node_modules/vite/dist/node/chunks/node.js')),pin(path.join(t,'node_modules/vite/dist/client/client.mjs')));
control.ports=[4294,4295];control.scope='Same unchanged 7file overlay, all31 tests/no additional assertion delta; loopback Vite dev supports same sharedclient source module, hmr:false/ws:false/watch:null/strictPort/corsfalse/emptywarmup/preTransformfalse; CSP permits HTTPloopback+fixturehttps connect and no ws/wss; denyproxy unchanged; same cached Chromium';
control.v2FailurePreserved='30/31, source-module import unavailable in static build; no app-defect inference; proxy0denial/localTransportErrors1 cause unassigned';
output('CRITICAL-FIXTURES-INPUTS-v3.json',JSON.stringify(control,null,2)+'\n');
let runner=readFileSync(path.join(e,'critical-fixtures-invoker-v2.mjs'),'utf8').replaceAll('critical-fixtures-v2','critical-fixtures-v3').replaceAll('CRITICAL-FIXTURES-v2','CRITICAL-FIXTURES-v3').replaceAll('critical-fixtures.playwright-v2','critical-fixtures.playwright-v3').replaceAll('CRITICAL-FIXTURES-INPUTS-v2.json','CRITICAL-FIXTURES-INPUTS-v3.json').replace('67bd8035f12f1cafee9741e7ff327f4e26ba1ef6fe42288a2c7977df76c7527d',sha(readFileSync(path.join(e,'CRITICAL-FIXTURES-INPUTS-v3.json')))).replaceAll('4292','4294').replaceAll('4293','4295');
// The source overlay is intentionally v2, not a new copy or new test change.
runner=runner.replace("priorV1FailurePreserved:true,", "priorV1FailurePreserved:true, priorV2FailurePreserved:true,");
output('critical-fixtures-invoker-v3.mjs',runner);
const freeze={schema:'mcy.critical-fixtures-control-freeze.v3',status:'PREPARED_NOT_INVOKED_REQUIRES_R3_ROOT_GO',sourceFreeze:pin(path.join(e,'SOURCE-FREEZE-v2.json')),effectiveDependencies:pin(path.join(e,'EFFECTIVE-DEPENDENCIES-v3.json')),inputs:pin(path.join(e,'CRITICAL-FIXTURES-INPUTS-v3.json')),invoker:pin(path.join(e,'critical-fixtures-invoker-v3.mjs')),overlay:pin(path.join(e,'CRITICAL-FIXTURES-OVERLAY-v2.json')),controls:control.controls,priorFailures:[pin(path.join(e,'CRITICAL-FIXTURES-v1.json')),pin(path.join(e,'CRITICAL-FIXTURES-v2.json'))],command:`& 'C:/Program Files/nodejs/node.exe' '${e}/critical-fixtures-invoker-v3.mjs' --root-approved-critical-fixtures-v3`,noAutomaticRetry:true};
output('CRITICAL-FIXTURES-CONTROL-FREEZE-v3.json',JSON.stringify(freeze,null,2)+'\n');
console.log(JSON.stringify({freeze:pin(path.join(e,'CRITICAL-FIXTURES-CONTROL-FREEZE-v3.json')),runner:freeze.invoker,inputs:freeze.inputs}));
