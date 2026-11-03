export type AuthLaunchSignals = {
  isNativePlatform: boolean;
  pathname: string;
  search: string;
  hash: string;
  storageKey: string | null;
  storageKeys: readonly string[] | null;
};

/**
 * Avoid loading the auth/data SDK for a first-time guest. Existing browser
 * sessions, auth callbacks, native deep links, and inaccessible storage stay
 * eager so account restoration is not delayed or silently skipped.
 */
export function shouldInitializeAuthOnLaunch(signals: AuthLaunchSignals): boolean {
  if (signals.isNativePlatform) return true;
  if (signals.pathname.replace(/\/+$/, "") === "/auth/callback") return true;

  const query = new URLSearchParams(signals.search.replace(/^\?/, ""));
  const fragment = new URLSearchParams(signals.hash.replace(/^#/, ""));
  const callbackParameters = ["code", "access_token", "refresh_token", "token_hash", "error"];
  if (callbackParameters.some(parameter => query.has(parameter) || fragment.has(parameter))) return true;

  if (!signals.storageKey || signals.storageKeys === null) return true;
  return signals.storageKeys.includes(signals.storageKey);
}
