// Prepare a source-only shadow candidate. No environment/credential files,
// cloud/device operations, application checkout edits or overwrites.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const root=path.resolve(process.cwd());
assert(root.toLowerCase()==='d:\\projects\\mcy','Exact MCY workspace required');
const hash=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const manifest='analyse/MCY_NATIVE_LEARNER_TRIAL_OPERATION_2026-10-13.json';
assert(hash(manifest)==='71bf0aa806e92d792bd55ad23592af22a78d76733a97af5f6ffa4f97ac19865d','Frozen trial drift');
const approved=JSON.parse(fs.readFileSync(manifest));
for(const item of [...approved.inputs,...approved.frozenApplicationSource])assert(hash(item.path)===item.sha256,'Frozen source drift');
const original='src/Prototype.tsx';
assert(hash(original)==='58b8845cf5790c251e85554a27a74b9cf6d41f1c1568330868a205a4bbb84bd0','Original source drift');
const target=path.resolve(root,'.vercel/native-checkin-late-save-candidate');
assert(target.startsWith(root+path.sep)&&path.relative(root,target)==='.vercel'+path.sep+'native-checkin-late-save-candidate','Candidate path outside workspace');
assert(!fs.existsSync(target),'Existing candidate: read stored state; do not overwrite');
fs.mkdirSync(target);
fs.cpSync(path.join(root,'src'),path.join(target,'src'),{recursive:true,errorOnExist:true,force:false});
fs.mkdirSync(path.join(target,'supabase/functions'),{recursive:true});
fs.cpSync(path.join(root,'supabase/functions/_shared'),path.join(target,'supabase/functions/_shared'),{recursive:true,errorOnExist:true,force:false});
for(const name of ['index.html','tsconfig.json'])fs.copyFileSync(path.join(root,name),path.join(target,name),fs.constants.COPYFILE_EXCL);
const source=fs.readFileSync(original,'utf8'),newline=source.includes('\r\n')?'\r\n':'\n';
let candidate=source;
function replaceOnce(from,to){assert(candidate.split(from).length===2,'Expected one exact source edit');candidate=candidate.replace(from,to);}
replaceOnce('  captureType: CheckinPayload["captureType"],'+newline+') {','  captureType: CheckinPayload["captureType"],'+newline+'  canDispatch: () => boolean,'+newline+') {');
replaceOnce('  if (!state.signedIn || !state.userId || !state.saveFeedbackConsent) return null;','  if (!canDispatch() || !state.signedIn || !state.userId || !state.saveFeedbackConsent) return null;');
replaceOnce('  const client = await getAccountBoundSupabaseClient(expectedUserId);'+newline+'  if (generation !== learnerSessionGeneration()) return null;','  const client = await getAccountBoundSupabaseClient(expectedUserId);'+newline+'  if (generation !== learnerSessionGeneration() || !canDispatch()) return null;');
replaceOnce('await persistCurrentCheckin({ ...state, consentBaseline: saved.consents, consentPolicyVersions: saved.policyVersions, privacyAccepted: true }, setState, "practice_preparation");','await persistCurrentCheckin({ ...state, consentBaseline: saved.consents, consentPolicyVersions: saved.policyVersions, privacyAccepted: true }, setState, "practice_preparation", current);');
replaceOnce('await persistCurrentCheckin({ ...nextState, displayName, onboardingComplete: true }, setState, "practice_preparation");','await persistCurrentCheckin({ ...nextState, displayName, onboardingComplete: true }, setState, "practice_preparation", current);');
replaceOnce('await persistCurrentCheckin(state, setState, "standalone");','await persistCurrentCheckin(state, setState, "standalone", current);');
const candidateFile=path.join(target,'src/Prototype.tsx');fs.writeFileSync(candidateFile,candidate);
assert(hash(original)==='58b8845cf5790c251e85554a27a74b9cf6d41f1c1568330868a205a4bbb84bd0','Original mutated');
console.log(JSON.stringify({status:'PREPARED_SOURCE_ONLY',target,candidateFile,candidateSha256:hash(candidateFile),originalUnchanged:true,environmentOrCredentialFilesCopied:false,cloudOrDeviceOperations:0}));
