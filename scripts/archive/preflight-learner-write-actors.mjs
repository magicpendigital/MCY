import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
const origin='https://mhumbczqrzutdnraafhs.supabase.co';
assert.equal(process.env.VITE_SUPABASE_URL?.replace(/\/$/,''),origin);
const key=process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
assert.ok(key?.startsWith('sb_publishable_'));
const actors=[];
for(const label of ['LEARNER_A','LEARNER_B']) {
  const token=process.env[`MCY_TEST_${label}_ACCESS_TOKEN`];
  if(!token){actors.push({label,present:false,authenticated:false});continue;}
  const claim=JSON.parse(Buffer.from(token.split('.')[1]??'','base64url').toString());
  const response=await fetch(origin+'/auth/v1/user',{headers:{apikey:key,authorization:`Bearer ${token}`},signal:AbortSignal.timeout(10000)});
  const user=response.ok?await response.json():null;
  actors.push({label,present:true,expiresAt:new Date(claim.exp*1000).toISOString(),authenticated:response.ok&&user?.id===claim.sub,emailConfirmed:!!user?.email_confirmed_at,httpStatus:response.status});
}
const receipt={kind:'LearnerWriteActorReadOnlyPreflight',capturedAt:new Date().toISOString(),projectRef:'mhumbczqrzutdnraafhs',actors,authWrites:false,databaseWrites:false,roleChanges:false};
writeFileSync('analyse/MCY_LEARNER_WRITE_ACTOR_PREFLIGHT_2026-10-11.json',JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify(receipt));
