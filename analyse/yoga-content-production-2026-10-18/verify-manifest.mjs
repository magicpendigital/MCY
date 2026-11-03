import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {libraryRoot,repoRoot,safeRelative,validateLibrary} from './validate-library.mjs';
import {renderLibrary} from './render-library.mjs';
import {packageArtifactFiles} from './create-manifest.mjs';
import {validateExpansionCatalog} from './validate-expansion-catalog.mjs';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
export async function assertManifestCoverage(root,listed,repo=repoRoot){for(const file of await packageArtifactFiles(root)){const relative=path.relative(repo,file).split(path.sep).join('/');if(!listed.has(relative))throw new Error('Unfrozen package file '+relative);}}
export async function verifyManifest(){
 const manifest=JSON.parse(await readFile(path.join(libraryRoot,'manifest.json'),'utf8'));
 if(manifest.schemaVersion!=='mcy-yoga-package-manifest-1'||manifest.status!=='local_draft_only'||manifest.learnerVisible!==false||manifest.recommendationEligible!==false||manifest.publishStatus!=='unpublished'||manifest.approvalRecords.length!==0||Object.values(manifest.humanReviews).some(v=>v!=='pending'))throw new Error('Manifest violates closed draft state');
 const listed=new Set();for(const input of manifest.inputs){if(!safeRelative(input.path)||listed.has(input.path)||input.path==='content/yoga-library/manifest.json')throw new Error('Unsafe/duplicate/self manifest input');listed.add(input.path);const bytes=await readFile(path.join(repoRoot,...input.path.split('/')));if(bytes.length!==input.bytes||hash(bytes)!==input.sha256)throw new Error('Frozen input drift '+input.path);}
 await assertManifestCoverage(libraryRoot,listed);
 const validation=await validateLibrary();await renderLibrary({check:true});if(JSON.stringify(validation)!==JSON.stringify(manifest.validation))throw new Error('Frozen coverage drift');const expansionValidation=await validateExpansionCatalog();if(JSON.stringify(expansionValidation)!==JSON.stringify(manifest.expansionValidation))throw new Error('Frozen expansion coverage drift');return {status:'PASS',inputFiles:listed.size,limits:'Byte consistency only; no signature, human identity, expertise, rights, app integration or release proof.'};
}
if(process.argv[1]===fileURLToPath(import.meta.url))console.log(JSON.stringify(await verifyManifest(),null,2));
