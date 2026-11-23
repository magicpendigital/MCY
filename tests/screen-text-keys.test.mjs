import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync,readdirSync} from 'node:fs';
import {screenTextKeys,isScreenTextKey,validScreenValue} from '../supabase/functions/_shared/contentWorkspaceContract.ts';

// The texts live in src/i18n.ts and its data files src/i18n/*.ts; read the file text so the check needs no module changes.
// In each file the vi table runs from `const vi… = {` to `const en…:`, and the en table from there to the end.
const i18nFiles=[new URL('../src/i18n.ts',import.meta.url),...readdirSync(new URL('../src/i18n/',import.meta.url)).filter(f=>f.endsWith('.ts')).sort().map(f=>new URL('../src/i18n/'+f,import.meta.url))];
let viBlock='',enBlock='';
for(const file of i18nFiles){
  const text=readFileSync(file,'utf8');
  const vi=text.search(/const vi\w* = \{/),en=text.search(/const en\w*:/);
  if(vi<0||en<vi)continue;
  viBlock+=text.slice(vi,en)+'\n';enBlock+=text.slice(en)+'\n';
}
const valueOf=(block,key)=>{
  const start=block.indexOf('"'+key+'": "');
  if(start<0)return null;
  let i=start+key.length+5,out='';
  for(;i<block.length&&block[i]!=='"';i++){if(block[i]==='\\')i++;out+=block[i];}
  return out;
};

test('every unlocked screen key exists in both languages, is not a placeholder text and is not a safety, privacy or consent text',()=>{
  assert.ok(screenTextKeys.length>0&&new Set(screenTextKeys).size===screenTextKeys.length);
  for(const key of screenTextKeys){
    for(const [name,block] of [['vi',viBlock],['en',enBlock]]){const v=valueOf(block,key);assert.ok(v&&v.length>0,`${key} missing in ${name}`);assert.ok(!/[{}]/.test(v),`${key} has a placeholder in ${name}`);}
    assert.ok(/^(discover|course)\./.test(key)&&!/(privacy|consent|note|source|player|safety|caution)/i.test(key),`${key} must be a plain navigation or heading text`);
  }
});
test('locked copy stays locked and replacement text is plain',()=>{
  for(const key of ['welcome.quote','welcome.tryGuest','checkin.step1.title','discover.courseNote','course.sourceNote','course.playerFrameLoaded','brand.name','brand.slogan'])assert.equal(isScreenTextKey(key),false,key);
  assert.equal(isScreenTextKey('constructor'),false);assert.equal(isScreenTextKey('__proto__'),false);
  for(const ok of ['Từ kênh Một chút yoga','A'])assert.equal(validScreenValue(ok),true);
  for(const bad of ['',' ','{count} bài','<b>x</b>','x'.repeat(501),42,null,undefined])assert.equal(validScreenValue(bad),false);
});
