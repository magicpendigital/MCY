// Small wrappers for APIs that older Safari lacks. The app must not crash on iOS 15.0 (see docs/quality/KNOWN_INCIDENTS.md,
// INC-001): crypto.randomUUID and Array.prototype.at need Safari 15.4, AbortSignal.timeout needs 16.0. Use these helpers
// instead of the raw APIs; tests/browser-compat.test.mjs fails the build when the raw APIs appear elsewhere in src/.

/** A random RFC 4122 version 4 id. Uses crypto.randomUUID when present, otherwise builds one from getRandomValues. */
export function newId(): string {
  const source = globalThis.crypto;
  if (source && typeof source.randomUUID === "function") return source.randomUUID();
  const bytes = new Uint8Array(16);
  if (source && typeof source.getRandomValues === "function") source.getRandomValues(bytes);
  else for (let index = 0; index < bytes.length; index++) bytes[index] = Math.floor(Math.random() * 256);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, "0"));
  return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10).join("")}`;
}

/** The last element, or undefined for an empty list (replaces `list.at(-1)`). */
export function lastOf<T>(items: readonly T[]): T | undefined {
  return items.length > 0 ? items[items.length - 1] : undefined;
}

/** An AbortSignal that fires after `ms`. Call `clear` once the request settles so a fallback timer does not linger. */
export function timeoutSignal(ms: number): { signal: AbortSignal; clear: () => void } {
  const native = (AbortSignal as { timeout?: (ms: number) => AbortSignal }).timeout;
  if (typeof native === "function") return { signal: native.call(AbortSignal, ms), clear: () => undefined };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, clear: () => clearTimeout(timer) };
}
