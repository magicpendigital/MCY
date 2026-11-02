import { publicStorageBase } from "../backend/supabase";
import type { Manifest, ManifestUnit, PublishedImage, PublishedStep, PublishedUnit } from "../../supabase/functions/_shared/readingPublication";

// Learner reading library. Everything here comes from public files the server wrote after a reviewer switched a unit
// on; nothing is bundled with the app and no sign-in is needed. Every value is checked before it is used.
export type { ManifestUnit, PublishedUnit, PublishedStep, PublishedImage };
export type ManifestRead = { status: "ok"; units: ManifestUnit[] } | { status: "empty" } | { status: "unavailable" };
export type UnitRead = { status: "ok"; unit: PublishedUnit } | { status: "gone" } | { status: "unavailable" };

const BUCKET = "reading-published";
const sha = /^[a-f0-9]{64}$/;
const slug = /^reading-[a-z0-9-]{1,72}$/;
const plain = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === "object" && !Array.isArray(value));
const text = (value: unknown, max: number): value is string => typeof value === "string" && value.length > 0 && value.length <= max;
const optionalText = (value: unknown, max: number) => value === undefined || text(value, max);
const textList = (value: unknown, max: number): value is string[] => Array.isArray(value) && value.length <= 20 && value.every(item => text(item, max));

function base(): string | null { return publicStorageBase(BUCKET); }
export const readingImageUrl = (hash: string): string | null => {
  const root = base();
  return root && sha.test(hash) ? `${root}/${hash}.webp` : null;
};

function parseManifest(data: unknown): ManifestUnit[] | null {
  if (!plain(data) || data.v !== 1 || !Array.isArray(data.units) || data.units.length > 60) return null;
  const units: ManifestUnit[] = [];
  for (const item of data.units) {
    if (!plain(item) || !text(item.id, 80) || !slug.test(item.id) || !text(item.version, 64) || !sha.test(item.version) || !text(item.title, 200)
      || !Number.isInteger(item.steps) || Number(item.steps) < 1 || Number(item.steps) > 20 || !["complete", "none", "partial"].includes(item.images as string)
      || item.path !== `units/${item.id}/${item.version}.json`) return null;
    units.push({ id: item.id, version: item.version, title: item.title, steps: Number(item.steps), images: item.images as ManifestUnit["images"], imageHashes: [], path: item.path as string });
  }
  return units;
}

function parseImage(value: unknown): PublishedImage | null {
  if (!plain(value) || !text(value.sha256, 64) || !sha.test(value.sha256) || !Number.isInteger(value.width) || !Number.isInteger(value.height)
    || Number(value.width) < 1 || Number(value.width) > 4000 || Number(value.height) < 1 || Number(value.height) > 4000 || !text(value.alt, 600) || !optionalText(value.caption, 400)) return null;
  return { sha256: value.sha256, width: Number(value.width), height: Number(value.height), alt: value.alt, ...(value.caption ? { caption: value.caption as string } : {}) };
}

function parseUnit(data: unknown, expect: ManifestUnit): PublishedUnit | null {
  if (!plain(data) || data.v !== 1 || data.id !== expect.id || data.version !== expect.version || !text(data.title, 200) || !text(data.locale, 16)
    || !optionalText(data.intro, 1500) || !optionalText(data.audience, 800) || !textList(data.prerequisites, 600) || !textList(data.preparation, 600)
    || !textList(data.learningObjectives, 600) || !textList(data.stopGuidance, 800) || !Array.isArray(data.steps) || data.steps.length < 1 || data.steps.length > 20) return null;
  const steps: PublishedStep[] = [];
  for (const raw of data.steps) {
    if (!plain(raw) || !text(raw.id, 40) || !Number.isInteger(raw.order) || !text(raw.title, 200) || !text(raw.body, 2000) || !optionalText(raw.detail, 2000)
      || !optionalText(raw.alternative, 1200) || !optionalText(raw.stopCue, 1200) || !Array.isArray(raw.images) || raw.images.length > 4) return null;
    const images = raw.images.map(parseImage);
    if (images.some(image => image === null)) return null;
    steps.push({ id: raw.id, order: Number(raw.order), title: raw.title, body: raw.body, ...(raw.detail ? { detail: raw.detail as string } : {}), ...(raw.alternative ? { alternative: raw.alternative as string } : {}), ...(raw.stopCue ? { stopCue: raw.stopCue as string } : {}), images: images as PublishedImage[] });
  }
  return {
    v: 1, id: data.id as string, version: data.version as string, title: data.title, locale: data.locale,
    ...(data.intro ? { intro: data.intro as string } : {}), ...(data.audience ? { audience: data.audience as string } : {}),
    prerequisites: data.prerequisites, preparation: data.preparation, learningObjectives: data.learningObjectives, stopGuidance: data.stopGuidance, steps,
  };
}

async function getJson(path: string): Promise<{ status: number; data: unknown } | null> {
  const root = base();
  if (!root) return null;
  try {
    const response = await fetch(`${root}/${path}`, { cache: "no-cache", credentials: "omit", headers: { Accept: "application/json" } });
    if (!response.ok) return { status: response.status, data: null };
    return { status: response.status, data: await response.json() };
  } catch {
    return null;
  }
}

// One manifest read per app session; a failed read is not cached so a later visit can retry.
let manifestRead: Promise<ManifestRead> | null = null;
export function readReadingManifest(refresh = false): Promise<ManifestRead> {
  if (manifestRead && !refresh) return manifestRead;
  const request = (async (): Promise<ManifestRead> => {
    if (!base()) return { status: "empty" };
    const result = await getJson("manifest.json");
    if (!result) return { status: "unavailable" };
    if (result.status === 404 || result.status === 400) return { status: "empty" };
    if (result.status !== 200) return { status: "unavailable" };
    const units = parseManifest(result.data);
    if (!units) return { status: "unavailable" };
    return units.length ? { status: "ok", units } : { status: "empty" };
  })();
  manifestRead = request;
  void request.then(result => { if (result.status === "unavailable" && manifestRead === request) manifestRead = null; });
  return request;
}

export async function readReadingUnit(entry: ManifestUnit): Promise<UnitRead> {
  const result = await getJson(entry.path);
  if (!result) return { status: "unavailable" };
  if (result.status === 404 || result.status === 400) return { status: "gone" };
  if (result.status !== 200) return { status: "unavailable" };
  const unit = parseUnit(result.data, entry);
  return unit ? { status: "ok", unit } : { status: "unavailable" };
}

// "Continue where I stopped": the step each unit was last open at, kept on this device only and tied to the exact version.
const POSITION_KEY = "mcy.readingPosition.v1";
type Position = { version: string; step: number; at: string };
const readPositions = (): Record<string, Position> => {
  try {
    const raw = JSON.parse(window.localStorage.getItem(POSITION_KEY) ?? "{}") as unknown;
    if (!plain(raw)) return {};
    return Object.fromEntries(Object.entries(raw).filter(([id, v]) => slug.test(id) && plain(v) && typeof v.version === "string" && sha.test(v.version) && Number.isInteger(v.step) && Number(v.step) >= 0 && typeof v.at === "string").slice(0, 40)) as Record<string, Position>;
  } catch {
    return {};
  }
};
export function savedReadingStep(id: string, version: string): number {
  const found = readPositions()[id];
  return found && found.version === version ? found.step : 0;
}
export function saveReadingStep(id: string, version: string, step: number) {
  try {
    const all = readPositions();
    if (step <= 0) delete all[id]; else all[id] = { version, step, at: new Date().toISOString() };
    window.localStorage.setItem(POSITION_KEY, JSON.stringify(all));
  } catch { /* storage blocked: the position then lasts for this session only */ }
}
