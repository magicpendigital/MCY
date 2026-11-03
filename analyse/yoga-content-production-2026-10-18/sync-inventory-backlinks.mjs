import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const root=path.join(repo,'content/yoga-library');
const file=path.join(root,'inventory.json');
const inventory=JSON.parse(await readFile(file,'utf8'));
const before=inventory.records.map(({contentUnitIds,...source})=>source);
const units=[];
for(const entry of await readdir(path.join(root,'units'),{withFileTypes:true})) {
 if(!entry.isDirectory()||entry.isSymbolicLink()) throw new Error('Unexpected unit directory');
 for(const name of await readdir(path.join(root,'units',entry.name))) {
  if(!/^r[1-9][0-9]*\.json$/.test(name)) throw new Error('Unexpected unit file');
  units.push(JSON.parse(await readFile(path.join(root,'units',entry.name,name),'utf8')));
 }
}
for(const record of inventory.records) {
 record.contentUnitIds=[...new Set(units.filter(u=>u.sourceRefs.some(ref=>ref.courseId===record.courseId&&ref.lessonId===record.id&&ref.youtubeId===record.youtubeId)).map(u=>u.id))].sort();
}
if(JSON.stringify(before)!==JSON.stringify(inventory.records.map(({contentUnitIds,...source})=>source))) throw new Error('Source record changed');
await writeFile(file,JSON.stringify(inventory,null,2)+'\n');
console.log(JSON.stringify({sourceRecords:inventory.records.length,linkedRecords:inventory.records.filter(r=>r.contentUnitIds.length).length,units:units.length,scope:'Backlinks only; canonical source fields preserved.'}));
