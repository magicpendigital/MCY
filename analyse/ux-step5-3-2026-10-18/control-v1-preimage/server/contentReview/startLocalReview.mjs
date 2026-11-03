import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createLocalReviewServer } from './localReviewServer.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const candidateRoot = path.resolve(here, '../..');
const repoRoot = path.resolve(candidateRoot, '../..');
const privateRoot = path.join(repoRoot, '.vercel/local-review-private');
const args = process.argv.slice(2);
if (args.length !== 4 || args[0] !== '--mode' || args[2] !== '--port' ||
    !['fictional_rehearsal', 'owner_local_preview'].includes(args[1]) ||
    !/^[0-9]{4,5}$/.test(args[3])) {
  throw new Error('Usage: node startLocalReview.mjs --mode fictional_rehearsal|owner_local_preview --port 4NNN');
}
const review = await createLocalReviewServer({
  mode: args[1], port: Number(args[3]), candidateRoot, repoRoot, privateRoot,
});
// Only paths are logged. Capability bytes never enter stdout, URLs, receipts or environment.
process.stdout.write(`${JSON.stringify({ pid: process.pid, origin: review.origin,
  mode: args[1], bootstrapFiles: review.bootstrapFiles })}\n`);
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, async () => { await review.close(); process.exit(0); });
}
