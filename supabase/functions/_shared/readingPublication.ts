import type { ReadingUnitCandidate, ReadingUnitMedia, ReadingUnitStep } from "./readingUnitCandidates.ts";

// Learner-facing publication of approved reading units (Owner decision 2026-11-02, option C): the server turns the
// reviewed candidates into a small public snapshot (manifest + one JSON per unit + approved-only images). Everything
// the learner app reads is built here from an explicit whitelist; review-only fields never leave this module.
export const PREVIEW_BUCKET = "reading-preview";
export const PUBLISHED_BUCKET = "reading-published";
export const MANIFEST_PATH = "manifest.json";

export type PublishedImage = { sha256: string; width: number; height: number; alt: string; caption?: string };
export type PublishedStep = { id: string; order: number; title: string; body: string; detail?: string; alternative?: string; stopCue?: string; images: PublishedImage[] };
export type PublishedUnit = {
  v: 1; id: string; version: string; title: string; locale: string; intro?: string; audience?: string;
  prerequisites: string[]; preparation: string[]; learningObjectives: string[]; stopGuidance: string[]; steps: PublishedStep[];
};
export type ManifestUnit = { id: string; version: string; title: string; steps: number; images: "complete" | "none" | "partial"; imageHashes: string[]; path: string };
export type Manifest = { v: 1; generatedAt: string; units: ManifestUnit[] };

export type HoldReason = "not_approved" | "switch_off" | "needs_images" | "copy_pass" | "media_unverified" | "media_copy_failed" | "upload_failed";
export type TextOnlyMode = "inherit" | "allow" | "require";
export type PublicationRow = { candidate_id: string; content_version: string; visible: boolean; text_only_allowed: boolean | null; updated_at?: string };
export type PublicationSnapshot = {
  role: string; default_text_only_allowed: boolean;
  approved: Array<{ candidate_id: string; content_version: string; reviewed_at?: string }>;
  rows: PublicationRow[];
};

const sha = /^[a-f0-9]{64}$/;
export const unitPath = (id: string, version: string) => `units/${id}/${version}.json`;
export const imagePath = (hash: string) => `${hash}.webp`;

// Internal editorial wording that must never reach a learner. A unit containing any of it is held back until its
// text is rewritten and re-approved; this is a guard, not a substitute for the editorial pass.
export const internalWording = /\bbrief\b|progression|nguồn local|\bnháp\b|chưa duyệt|blocker|\bdraft\b|provenance|evidence|analyse\/|media\/|\.webp|\.png|source-\d|prompt/i;

const asList = (value: unknown): string[] => Array.isArray(value)
  ? value.flatMap(item => typeof item === "string" && item.trim() ? [item.trim()] : [])
  : typeof value === "string" && value.trim() ? [value.trim()] : [];

// "Ảnh AI nháp — <text>. Chưa duyệt chuyên môn/quyền." -> "<text>."; anything else is dropped rather than guessed at.
export function learnerCaption(caption: unknown): string | undefined {
  if (typeof caption !== "string") return undefined;
  const trimmed = caption.trim();
  const match = trimmed.match(/^Ảnh AI nháp — (.+?)\.?\s*Chưa duyệt chuyên môn\/quyền\.?$/);
  // A caption that never carried the draft markers is already learner wording; keep it only if it is clean.
  const text = (match ? match[1] : trimmed).trim().replace(/\.$/, "");
  return text && !internalWording.test(text) ? `${text}.` : undefined;
}

const usableImage = (media: ReadingUnitMedia | undefined): media is ReadingUnitMedia & { sha256: string; width: number; height: number; alt: string } =>
  Boolean(media && media.status === "draft_present" && typeof media.sha256 === "string" && sha.test(media.sha256) && media.mime === "image/webp"
    && Number.isInteger(media.width) && Number(media.width) > 0 && Number.isInteger(media.height) && Number(media.height) > 0
    && typeof media.alt === "string" && media.alt.trim().length >= 10);

// The generated registry keeps the disclosure text, not the synthetic flag; only images disclosed as AI-made are delivered.
const aiDisclosed = (media: ReadingUnitMedia) => (media as { synthetic?: unknown }).synthetic === true || (typeof media.disclosure === "string" && /^(Ảnh do AI tạo|Ảnh AI minh họa|Minh họa tạo bằng AI)/.test(media.disclosure.trim()));

export function imageCoverage(candidate: ReadingUnitCandidate) {
  const media = new Map(candidate.unit.media.map(m => [m.id, m]));
  const stepsWithImage = candidate.unit.steps.filter(step => (step.mediaIds ?? []).some(id => media.get(id)?.status === "draft_present")).length;
  const total = candidate.unit.steps.length;
  return { total, stepsWithImage, state: stepsWithImage === 0 ? "none" as const : stepsWithImage === total ? "complete" as const : "partial" as const };
}

export type Projection = { ok: true; unit: PublishedUnit } | { ok: false; reason: "copy_pass" | "media_unverified" };

export function projectUnit(candidate: ReadingUnitCandidate): Projection {
  const content = candidate.unit;
  const media = new Map(content.media.map(m => [m.id, m]));
  const steps: PublishedStep[] = [];
  for (const step of content.steps as ReadingUnitStep[]) {
    const images: PublishedImage[] = [];
    for (const id of step.mediaIds ?? []) {
      const item = media.get(id);
      if (!item || item.status !== "draft_present") continue;
      // Only synthetic, correctly described, webp images with a verified hash are ever delivered.
      if (!usableImage(item) || !aiDisclosed(item)) return { ok: false, reason: "media_unverified" };
      const caption = learnerCaption(item.caption);
      images.push({ sha256: item.sha256, width: Number(item.width), height: Number(item.height), alt: item.alt.trim(), ...(caption ? { caption } : {}) });
    }
    steps.push({
      id: step.id, order: step.order, title: step.title, body: step.body,
      ...(step.detail ? { detail: step.detail } : {}), ...(step.alternative ? { alternative: step.alternative } : {}), ...(step.stopCue ? { stopCue: step.stopCue } : {}),
      images,
    });
  }
  const unit: PublishedUnit = {
    v: 1, id: candidate.id, version: candidate.version, title: candidate.title, locale: content.locale,
    ...(content.intro ? { intro: content.intro } : {}), ...(content.audience ? { audience: content.audience } : {}),
    prerequisites: asList(content.prerequisites), preparation: asList(content.preparation),
    learningObjectives: asList(content.learningObjectives), stopGuidance: asList(content.stopGuidance), steps,
  };
  const strings: string[] = [unit.title, unit.intro ?? "", unit.audience ?? "", ...unit.prerequisites, ...unit.preparation, ...unit.learningObjectives, ...unit.stopGuidance];
  for (const step of steps) strings.push(step.title, step.body, step.detail ?? "", step.alternative ?? "", step.stopCue ?? "", ...step.images.flatMap(i => [i.alt, i.caption ?? ""]));
  if (!unit.stopGuidance.length || strings.some(text => internalWording.test(text))) return { ok: false, reason: "copy_pass" };
  return { ok: true, unit };
}

export type Evaluation = {
  id: string; version: string; visible: boolean; mode: TextOnlyMode; show: boolean; reason: HoldReason | "ok";
  coverage: ReturnType<typeof imageCoverage>; projection?: Projection;
};

export function evaluateUnit(candidate: ReadingUnitCandidate, snapshot: PublicationSnapshot): Evaluation {
  const review = snapshot.approved.find(a => a.candidate_id === candidate.id && a.content_version === candidate.version);
  const approved = Boolean(review);
  const row = snapshot.rows.find(r => r.candidate_id === candidate.id && r.content_version === candidate.version);
  // The switch counts only if it was set after the latest review: a new review (or withdrawal and re-approval) hides the unit until it is switched on again.
  const switchedAfterReview = !review?.reviewed_at || !row?.updated_at || Date.parse(row.updated_at) >= Date.parse(review.reviewed_at);
  const visible = row?.visible === true && switchedAfterReview;
  const override = row?.text_only_allowed ?? null;
  const mode: TextOnlyMode = override === null ? "inherit" : override ? "allow" : "require";
  const coverage = imageCoverage(candidate);
  const base = { id: candidate.id, version: candidate.version, visible, mode, coverage };
  if (!approved) return { ...base, show: false, reason: "not_approved" };
  if (!visible) return { ...base, show: false, reason: "switch_off" };
  const textOnlyAllowed = override ?? snapshot.default_text_only_allowed === true;
  if (coverage.state !== "complete" && !textOnlyAllowed) return { ...base, show: false, reason: "needs_images" };
  const projection = projectUnit(candidate);
  if (!projection.ok) return { ...base, show: false, reason: projection.reason, projection };
  return { ...base, show: true, reason: "ok", projection };
}

export function buildManifest(shown: Array<{ candidate: ReadingUnitCandidate; unit: PublishedUnit }>, now: Date): Manifest {
  return {
    v: 1, generatedAt: now.toISOString(),
    units: shown.map(({ candidate, unit }) => {
      const hashes = [...new Set(unit.steps.flatMap(s => s.images.map(i => i.sha256)))];
      return { id: candidate.id, version: candidate.version, title: candidate.title, steps: unit.steps.length, images: imageCoverage(candidate).state, imageHashes: hashes, path: unitPath(candidate.id, candidate.version) };
    }),
  };
}

type StorageError = { message?: string; statusCode?: string | number } | null;
export type PublicationStorage = {
  from(bucket: string): {
    copy?(from: string, to: string, options?: { destinationBucket?: string }): PromiseLike<{ data: unknown; error: StorageError }>;
    upload?(path: string, body: string, options: { contentType: string; cacheControl: string; upsert: boolean }): PromiseLike<{ data: unknown; error: StorageError }>;
    download?(path: string): PromiseLike<{ data: { text(): Promise<string> } | null; error: StorageError }>;
    remove?(paths: string[]): PromiseLike<{ data: unknown; error: StorageError }>;
  };
};

const alreadyThere = (error: StorageError) => Boolean(error && (String(error.statusCode) === "409" || /already exists|duplicate/i.test(error.message ?? "")));
const notFound = (error: StorageError) => Boolean(error && (String(error.statusCode) === "404" || /not found|does not exist/i.test(error.message ?? "")));

export type SyncResult =
  | { ok: true; shown: string[]; held: Array<{ id: string; reason: HoldReason | "ok" }> }
  | { ok: false; error: "storage_unavailable" | "manifest_write_failed" };

// Idempotent rebuild of the public snapshot from the database state. Order matters: images, then unit files, and the
// manifest last, so a learner can never read a manifest that points at a file that is not there yet. A unit whose
// files cannot be written is simply left out; withdrawals always proceed.
export async function syncPublication(storage: PublicationStorage | undefined, candidates: readonly ReadingUnitCandidate[], snapshot: PublicationSnapshot, now = new Date()): Promise<SyncResult> {
  if (!storage) return { ok: false, error: "storage_unavailable" };
  const published = storage.from(PUBLISHED_BUCKET);
  const preview = storage.from(PREVIEW_BUCKET);
  if (!published.upload || !published.download || !published.remove || !preview.copy) return { ok: false, error: "storage_unavailable" };

  const held: Array<{ id: string; reason: HoldReason | "ok" }> = [];
  const shown: Array<{ candidate: ReadingUnitCandidate; unit: PublishedUnit }> = [];
  for (const candidate of candidates) {
    const result = evaluateUnit(candidate, snapshot);
    if (!result.show || !result.projection?.ok) { held.push({ id: candidate.id, reason: result.reason }); continue; }
    const unit = result.projection.unit;
    let failed: HoldReason | null = null;
    try {
      for (const hash of new Set(unit.steps.flatMap(s => s.images.map(i => i.sha256)))) {
        const { error } = await preview.copy(imagePath(hash), imagePath(hash), { destinationBucket: PUBLISHED_BUCKET });
        if (error && !alreadyThere(error)) { failed = "media_copy_failed"; break; }
      }
      if (!failed) {
        const { error } = await published.upload(unitPath(candidate.id, candidate.version), JSON.stringify(unit), { contentType: "application/json", cacheControl: "300", upsert: true });
        if (error) failed = "upload_failed";
      }
    } catch { failed = failed ?? "upload_failed"; }
    if (failed) held.push({ id: candidate.id, reason: failed }); else shown.push({ candidate, unit });
  }

  let previous: Manifest | null = null;
  let previousReadable = false;
  try {
    const { data, error } = await published.download(MANIFEST_PATH);
    if (data && !error) { previous = JSON.parse(await data.text()) as Manifest; previousReadable = Boolean(previous && Array.isArray(previous.units)); }
    else if (notFound(error)) previousReadable = true;
  } catch { previousReadable = false; }

  const manifest = buildManifest(shown, now);
  try {
    const { error } = await published.upload(MANIFEST_PATH, JSON.stringify(manifest), { contentType: "application/json", cacheControl: "60", upsert: true });
    if (error) return { ok: false, error: "manifest_write_failed" };
  } catch { return { ok: false, error: "manifest_write_failed" }; }

  // Remove what the old manifest listed and the new one no longer needs. Best effort: leftovers are never referenced.
  if (previousReadable && previous) {
    const keepUnits = new Set(manifest.units.map(u => u.path));
    const keepImages = new Set(manifest.units.flatMap(u => u.imageHashes));
    const stale = previous.units.flatMap(u => [
      ...(typeof u.path === "string" && /^units\/[a-z0-9-]+\/[a-f0-9]{64}\.json$/.test(u.path) && !keepUnits.has(u.path) ? [u.path] : []),
      ...(Array.isArray(u.imageHashes) ? u.imageHashes.filter(h => typeof h === "string" && sha.test(h) && !keepImages.has(h)).map(imagePath) : []),
    ]);
    if (stale.length) { try { await published.remove([...new Set(stale)]); } catch { /* unreferenced leftovers are harmless */ } }
  }
  return { ok: true, shown: shown.map(s => s.candidate.id), held };
}
