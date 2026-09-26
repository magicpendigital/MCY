import { createClient } from "@supabase/supabase-js";
import { Capacitor } from "@capacitor/core";
import type { Database } from "./database.types";

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

export const backendConfigured = Boolean(url && publishableKey);

export const supabase = backendConfigured
  ? createClient<Database>(url!, publishableKey!, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
        flowType: "pkce",
      },
      global: {
        headers: { "X-Client-Info": `mcy-learner/${Capacitor.getPlatform()}` },
      },
    })
  : null;

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
