import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { Capacitor } from "@capacitor/core";
import type { Database } from "./database.types";
import { shouldInitializeAuthOnLaunch } from "./authStartup";
import { authRedirectForWorkspace, type AuthWorkspace } from "./authRouting";
import { emailLocaleRedirect } from "./emailLocale";
import type { AppLocale } from "../i18n";
import { syncEmailLocaleForSession } from "./authEmailMetadata";

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

/** Base URL for objects of a public Storage bucket of this project (readable without sign-in), or null without a backend. */
export function publicStorageBase(bucket: string): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" ? `${parsed.origin}/storage/v1/object/public/${bucket}` : null;
  } catch {
    return null;
  }
}

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

/** One operation keeps the initiating account's token, never a later shared session. */
export async function getAccountBoundSupabaseClient(expectedUserId: string): Promise<SupabaseClient<Database>> {
  const shared = await getSupabaseClient();
  if (!shared) throw new Error("backend_unavailable");
  const { data, error } = await shared.auth.getSession();
  const session = data.session;
  if (error || session?.user.id !== expectedUserId || !session.user.email_confirmed_at || !session.access_token || !session.expires_at || session.expires_at <= Date.now() / 1000) throw new Error("account_changed");
  const token = session.access_token;
  const { createClient } = await import("@supabase/supabase-js");
  return createClient<Database>(url!, publishableKey!, {
    accessToken: async () => token,
    global: { headers: { "X-Client-Info": `mcy-learner/${Capacitor.getPlatform()}` } },
  });
}

export function clientChannel(): "web" | "ios" | "android" {
  const platform = Capacitor.getPlatform();
  if (platform === "ios" || platform === "android") return platform;
  return "web";
}

export function authRedirectUrl(workspace: AuthWorkspace = "learner", emailLocale?: AppLocale) {
  if (Capacitor.isNativePlatform()) {
    const scheme = import.meta.env.VITE_NATIVE_AUTH_SCHEME?.trim() || "motchutyoga";
    return authRedirectForWorkspace(`${scheme}://auth/callback`, workspace);
  }
  const callback = authRedirectForWorkspace(`${window.location.origin}/auth/callback`, workspace);
  return emailLocale ? emailLocaleRedirect(callback, emailLocale) : callback;
}

/** Cosmetic metadata only; the captured verified session determines the account. */
export async function syncAuthEmailLocale(session: Session, locale: AppLocale): Promise<boolean> {
  return url && publishableKey ? syncEmailLocaleForSession(session, locale, { url, publishableKey }) : false;
}
