import type { Dispatch, SetStateAction } from "react";
import { Capacitor } from "@capacitor/core";
import { newId } from "../compat";
import type { AppLocale } from "../i18n";
import { clientChannel, getAccountBoundSupabaseClient, getSupabaseClient, syncAuthEmailLocale } from "../backend/supabase";
import { normalizeEmailLocale, readEmailLocale, rememberEmailLocale } from "../backend/emailLocale";
import { learnerSessionGeneration } from "../backend/learnerSession";
import { persistConsentChoices } from "../backend/consentPersistence";
import { bodyRegionCodes } from "../bodyRegions";
import {
  isCurrentLearnerSession,
  saveLearnerCheckin,
  type CheckinPayload,
  type ConsentState,
  type LearnerCheckin,
} from "../backend/learnerData";
import { BODY_LEVELS, type BodyStyle, type DemoState, type Energy } from "./model";
import { snapshotFromDatabase, todayLocalDate } from "./snapshots";

export function consentStateForDemo(state: DemoState): ConsentState {
  return {
    terms: state.termsAccepted,
    privacy: state.privacyAccepted,
    wellbeing_data: state.saveFeedbackConsent,
    ai_processing: state.aiConsent,
    teacher_sharing: state.teacherShareConsent,
    notifications: state.notificationEnabled,
    marketing: state.marketingConsent,
  };
}
export async function persistConsentChanges(state: DemoState, source: "onboarding" | "settings", retryKeys: Map<string,string>) {
  // The development-only layout preview has no Auth identity or database writes.
  if (import.meta.env.DEV && !state.userId && new URLSearchParams(window.location.search).get("review-screen") === "consent") {
    return { consents: consentStateForDemo(state), policyVersions: state.consentPolicyVersions, matchesRequested: true, hasUnsettledWrites: false };
  }
  if (!state.userId) throw new Error("account_changed");
  const generation = learnerSessionGeneration();
  const client = await getAccountBoundSupabaseClient(state.userId);
  return persistConsentChoices(client, state.userId, consentStateForDemo(state), source, retryKeys, clientChannel(), () => generation === learnerSessionGeneration());
}
export async function persistProfile(state: DemoState, displayName: string, bodyStyle: BodyStyle, locale: AppLocale = state.locale) {
  if (!state.userId) return;
  const generation = learnerSessionGeneration();
  const shared = await getSupabaseClient();
  if (!shared) return;
  const { data: auth } = await shared.auth.getSession();
  if (auth.session?.user.id !== state.userId) throw new Error("account_changed");
  const session = auth.session;
  const client = await getAccountBoundSupabaseClient(state.userId);
  if (generation !== learnerSessionGeneration()) return false;
  const { error } = await client.from("profiles").upsert({
    user_id: state.userId,
    display_name: displayName.trim() || null,
    locale,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Ho_Chi_Minh",
    body_display_preference: bodyStyle,
  }, { onConflict: "user_id" });
  if (error) throw new Error(error.message);
  if (generation !== learnerSessionGeneration()) return false;
  const emailLocale = Capacitor.isNativePlatform()
    ? normalizeEmailLocale(session.user.user_metadata.locale) ?? locale
    : locale !== state.locale ? locale : readEmailLocale(state.locale);
  rememberEmailLocale(emailLocale);
  return syncAuthEmailLocale(session, emailLocale);
}
export function toLearnerCheckinPayload(state: DemoState, captureType: CheckinPayload["captureType"], idempotencyKey: string): CheckinPayload {
  const observations: CheckinPayload["observations"] = [];
  for (const item of state.preObservations) {
    for (const regionCode of bodyRegionCodes(item.region, item.side)) {
      const clear = item.level === "Không khó chịu";
      const state = item.status === "uncertain" || (!clear && !item.level) ? "uncertain" : clear ? "no_discomfort" : "discomfort";
      observations.push({
        regionCode,
        state,
        level: state === "discomfort" ? Math.max(1, BODY_LEVELS.indexOf(item.level!)) : null,
        note: item.note.trim() || null,
      });
    }
  }
  const energyValues: Energy[] = ["Rất thấp", "Thấp", "Bình thường", "Khá ổn", "Tràn đầy"];
  return {
    localDate: todayLocalDate(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Ho_Chi_Minh",
    energyLevel: state.energy ? energyValues.indexOf(state.energy) : null,
    bodyStatus: state.bodyStatus,
    captureType,
    observations,
    idempotencyKey,
  };
}
export async function persistCurrentCheckin(
  state: DemoState,
  setState: Dispatch<SetStateAction<DemoState>>,
  captureType: CheckinPayload["captureType"],
  canDispatch: () => boolean,
) {
  if (!canDispatch() || !state.signedIn || !state.userId || !state.saveFeedbackConsent) return null;
  const expectedUserId = state.userId;
  const generation = learnerSessionGeneration();
  const client = await getAccountBoundSupabaseClient(expectedUserId);
  if (generation !== learnerSessionGeneration() || !canDispatch()) return null;
  const payload = state.pendingCheckinPayload ?? toLearnerCheckinPayload(state, captureType, state.pendingCheckinIdempotencyKey ?? newId());
  const idempotencyKey = payload.idempotencyKey;
  const current = (previous: DemoState) => generation === learnerSessionGeneration() && isCurrentLearnerSession(previous.signedIn, previous.userId, expectedUserId);
  setState(previous => current(previous)
    ? { ...previous, pendingCheckinIdempotencyKey: idempotencyKey, pendingCheckinPayload: payload, backendStatus: "loading", backendError: "" }
    : previous);
  const saved = await saveLearnerCheckin(client, payload, expectedUserId);
  if (generation !== learnerSessionGeneration()) return null;
  const row: LearnerCheckin = {
    id: saved.checkin_id,
    user_id: state.userId,
    local_date: payload.localDate,
    local_timezone: payload.timezone,
    energy_level: payload.energyLevel,
    overall_note: null,
    body_status: payload.bodyStatus,
    capture_type: payload.captureType,
    idempotency_key: idempotencyKey,
    created_at: saved.created_at,
    updated_at: saved.created_at,
  };
  const snapshot = snapshotFromDatabase(row, payload.observations.map((item, index) => ({
    id: `${saved.checkin_id}-${index}`,
    checkin_id: saved.checkin_id,
    user_id: state.userId!,
    region_code: item.regionCode,
    state: item.state,
    level: item.level,
    note: item.note,
    created_at: saved.created_at,
    updated_at: saved.created_at,
  })));
  setState(previous => current(previous)
    ? {
        ...previous,
        remoteCheckins: [...previous.remoteCheckins.filter(item => item.remoteId !== saved.checkin_id), snapshot],
        ...(previous.pendingCheckinIdempotencyKey === idempotencyKey ? {
          currentRemoteCheckinId: saved.checkin_id, pendingCheckinIdempotencyKey: null, pendingCheckinPayload: null, backendStatus: "ready" as const,
        } : {}),
        backendError: "",
      }
    : previous);
  return snapshot;
}
