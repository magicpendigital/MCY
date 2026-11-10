import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {screenTextKeys,isScreenTextKey,validScreenValue} from '../supabase/functions/_shared/contentWorkspaceContract.ts';

// i18n.ts keeps its tables private; read the file text so the check needs no module changes.
const i18n=readFileSync(new URL('../src/i18n.ts',import.meta.url),'utf8');
const viBlock=i18n.slice(i18n.indexOf('const vi = {'),i18n.indexOf('const en:'));
const enBlock=i18n.slice(i18n.indexOf('const en:'));
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
