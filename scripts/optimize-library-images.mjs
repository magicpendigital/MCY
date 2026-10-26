// Converts the yoga-library draft PNG masters to WebP delivery files and archives the masters outside the repository.
//
//   node scripts/optimize-library-images.mjs --archive <dir>            dry run: sizes and hashes only
//   node scripts/optimize-library-images.mjs --archive <dir> --apply    copy masters, encode WebP, rewrite unit JSON
//
// Needs `sharp` (not a project dependency): `npm i --no-save sharp`, or point MCY_SHARP_MODULE at an installed copy.
// The archive copy is verified by SHA-256 before anything in the repository is rewritten or deleted. The master's hash
// stays in provenance.sourceSha256, so lineage (master -> delivery file) remains checkable with archive-manifest.json.
import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const library = path.join(repo, "content", "yoga-library");
const args = process.argv.slice(2);
const apply = args.includes("--apply");
const archiveRoot = args[args.indexOf("--archive") + 1];
if (!archiveRoot || archiveRoot.startsWith("--")) throw new Error("Pass --archive <directory outside the repository>");
const archive = path.resolve(archiveRoot);
if (archive === repo || archive.startsWith(repo + path.sep)) throw new Error("The archive must be outside the repository");
const WIDTH = 1280, QUALITY = 80;
const sharp = (await import(process.env.MCY_SHARP_MODULE ? pathToFileURL(process.env.MCY_SHARP_MODULE).href : "sharp")).default;
const sha = bytes => createHash("sha256").update(bytes).digest("hex");

const archived = [];
let before = 0, after = 0;
const unitFiles = [];
for (const dir of await readdir(path.join(library, "units"))) {
  for (const name of await readdir(path.join(library, "units", dir))) if (/^r\d+\.json$/.test(name)) unitFiles.push(path.join(library, "units", dir, name));
}
for (const file of unitFiles) {
  const unit = JSON.parse(await readFile(file, "utf8"));
  let changed = false;
  for (const media of unit.media) {
    if (media.status !== "draft_present" || !media.path?.endsWith(".png")) continue;
    const master = path.join(library, media.path);
    const bytes = await readFile(master);
    if (sha(bytes) !== media.sha256) throw new Error(`master hash mismatch: ${media.path}`);
    const webpRelative = media.path.replace(/\.png$/, ".webp");
    const { data, info } = await sharp(bytes).resize({ width: WIDTH, withoutEnlargement: true }).webp({ quality: QUALITY, effort: 5 }).toBuffer({ resolveWithObject: true });
    before += bytes.length; after += data.length;
    archived.push({ path: media.path, sha256: media.sha256, bytes: bytes.length, deliveryPath: webpRelative, deliverySha256: sha(data), deliveryBytes: data.length });
    if (!apply) continue;
    const target = path.join(archive, "yoga-library-originals", media.path);
    await mkdir(path.dirname(target), { recursive: true });
    await copyFile(master, target);
    if (sha(await readFile(target)) !== media.sha256) throw new Error(`archive copy failed verification: ${media.path}`);
    await writeFile(path.join(library, webpRelative), data);
    for (const brief of unit.assetBriefs ?? []) if (brief.mediaId === media.id) { brief.path = webpRelative; brief.sha256 = sha(data); }
    if (media.provenance.sourcePath === `content/yoga-library/${media.path}`) media.provenance.sourcePath = `archive:${media.path}`;
    media.provenance.notes = `${media.provenance.notes ?? ""} Delivery file is a WebP derivative (sharp, quality ${QUALITY}, max ${WIDTH}px wide) of the master PNG named in sourceSha256; the master is archived outside the repository (archive-manifest.json).`.trim();
    media.path = webpRelative; media.sha256 = sha(data); media.mime = "image/webp"; media.width = info.width; media.height = info.height;
    changed = true;
  }
  if (apply && changed) await writeFile(file, JSON.stringify(unit, null, 2) + "\n");
}
console.log(`${archived.length} images: ${(before / 1048576).toFixed(1)} MiB -> ${(after / 1048576).toFixed(2)} MiB (${(100 - 100 * after / before).toFixed(1)}% smaller).`);
if (!apply) { console.log("Dry run: nothing was written. Re-run with --apply."); process.exit(0); }

const manifest = { schemaVersion: "mcy-archive-manifest-1", createdAt: new Date().toISOString(), note: "Master PNGs archived outside the repository; hashes are of the original bytes. Delivery files are WebP derivatives.", files: archived };
await writeFile(path.join(archive, "yoga-library-originals", "ARCHIVE-MANIFEST.json"), JSON.stringify(manifest, null, 2) + "\n");
await writeFile(path.join(library, "archive-manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
for (const item of archived) await rm(path.join(library, item.path));
// Remove master directories that became empty.
const prune = async directory => { for (const entry of await readdir(directory, { withFileTypes: true })) if (entry.isDirectory()) { await prune(path.join(directory, entry.name)); if (!(await readdir(path.join(directory, entry.name))).length) await rm(path.join(directory, entry.name), { recursive: true }); } };
await prune(path.join(library, "media"));
console.log(`Archived ${archived.length} masters to ${path.join(archive, "yoga-library-originals")} and removed them from the repository tree.`);
await stat(path.join(archive, "yoga-library-originals", "ARCHIVE-MANIFEST.json"));
