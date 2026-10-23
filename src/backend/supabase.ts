import type { SupabaseClient } from "@supabase/supabase-js";
import { Capacitor } from "@capacitor/core";
import type { Database } from "./database.types";
import { shouldInitializeAuthOnLaunch } from "./authStartup";

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
const authStorageKey = (() => {
  if (!url) return null;
  try {
    return `sb-${new URL(url).hostname.split(".")[0]}-auth-token`;
  } catch {
    return null;
  }
})();

export const backendConfigured = Boolean(url && publishableKey);

/** True when the browser/WebView still holds a persisted Auth session for this project. */
export function hasStoredAuthSession(): boolean {
  try {
    return Boolean(authStorageKey && window.localStorage.getItem(authStorageKey));
  } catch {
    return false;
  }
}

export function shouldInitializeAuthForCurrentLaunch(): boolean {
  let storageKeys: string[] | null;
  try {
    storageKeys = Object.keys(window.localStorage);
  } catch {
    storageKeys = null;
  }

  return shouldInitializeAuthOnLaunch({
    isNativePlatform: Capacitor.isNativePlatform(),
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
    storageKey: authStorageKey,
    storageKeys,
  });
}

let clientPromise: Promise<SupabaseClient<Database>> | null = null;

/** Load the backend SDK only after an authenticated/data-backed path is needed. */
export function getSupabaseClient(): Promise<SupabaseClient<Database> | null> {
  if (!backendConfigured) return Promise.resolve(null);
  if (!clientPromise) {
    clientPromise = import("@supabase/supabase-js")
      .then(({ createClient }) => createClient<Database>(url!, publishableKey!, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
        flowType: "pkce",
      },
      global: {
        headers: { "X-Client-Info": `mcy-learner/${Capacitor.getPlatform()}` },
      },
      }))
      .catch(error => {
        clientPromise = null;
        throw error;
      });
  }
  return clientPromise;
}

export function clientChannel(): "web" | "ios" | "android" {
  const platform = Capacitor.getPlatform();
  if (platform === "ios" || platform === "android") return platform;
  return "web";
}

export function authRedirectUrl() {
  if (Capacitor.isNativePlatform()) {
    const scheme = import.meta.env.VITE_NATIVE_AUTH_SCHEME?.trim() || "motchutyoga";
    return `${scheme}://auth/callback`;
  }
  return `${window.location.origin}/auth/callback`;
}
