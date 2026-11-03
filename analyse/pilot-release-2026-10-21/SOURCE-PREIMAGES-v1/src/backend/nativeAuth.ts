export const NATIVE_AUTH_PENDING_KEY = "mcy.native-auth-pending-at";
export const MAX_NATIVE_AUTH_CALLBACK_URL_LENGTH = 8192;
export const MAX_HANDLED_NATIVE_AUTH_URLS = 16;
const NATIVE_AUTH_MAX_AGE_MS = 15 * 60 * 1000;

export function rememberNativeAuthUrl(cache: Set<string>, url: string): boolean {
  if (!url || url.length > MAX_NATIVE_AUTH_CALLBACK_URL_LENGTH || cache.has(url)) return false;
  while (cache.size >= MAX_HANDLED_NATIVE_AUTH_URLS) {
    const oldest = cache.values().next().value;
    if (oldest === undefined) break;
    cache.delete(oldest);
  }
  cache.add(url);
  return true;
}

export function nativeAuthCodeFromCallback(
  callbackUrl: string,
  expectedRedirectUrl: string,
  pendingAt: string | null,
  now = Date.now(),
): string | null {
  if (!pendingAt || !/^\d{10,13}$/.test(pendingAt)) return null;
  const startedAt = Number(pendingAt);
  if (!Number.isSafeInteger(startedAt) || startedAt > now || now - startedAt > NATIVE_AUTH_MAX_AGE_MS) return null;

  try {
    const callback = new URL(callbackUrl);
    const expected = new URL(expectedRedirectUrl);
    if (callback.protocol !== expected.protocol
      || callback.hostname !== expected.hostname
      || callback.pathname !== expected.pathname
      || callback.port !== expected.port
      || callback.username
      || callback.password) return null;
    const code = callback.searchParams.get("code");
    return code && code.length <= 4096 && !/\s/.test(code) ? code : null;
  } catch {
    return null;
  }
}
