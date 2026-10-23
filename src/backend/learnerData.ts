import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "./database.types";
import type { BodyRegionCode } from "../bodyRegions";

export type LearnerClient = SupabaseClient<Database>;
export type LearnerProfile = Database["public"]["Tables"]["profiles"]["Row"];
export type LearnerCheckin = Database["public"]["Tables"]["checkins"]["Row"];
export type LearnerObservation = Database["public"]["Tables"]["checkin_observations"]["Row"];

export type ConsentPurpose =
  | "terms"
  | "privacy"
  | "wellbeing_data"
  | "ai_processing"
  | "teacher_sharing"
  | "notifications"
  | "marketing";
export type ConsentState = Record<ConsentPurpose, boolean>;
export type ConsentPolicyVersions = Partial<Record<ConsentPurpose, string>>;

// These are version IDs for the current Vietnamese review text, not a claim
// that the text has completed legal review. Bump each ID when its copy changes.
export const REQUIRED_CONSENT_POLICY_VERSIONS = {
  terms: "terms-review-0.1",
  privacy: "privacy-review-0.1",
} as const;

// Versioned separately because model processing is optional and can be revoked
// without changing the learner's required service/privacy acceptance.
export const CONSENT_POLICY_VERSIONS: Record<ConsentPurpose, string> = {
  terms: REQUIRED_CONSENT_POLICY_VERSIONS.terms,
  privacy: REQUIRED_CONSENT_POLICY_VERSIONS.privacy,
  wellbeing_data: "wellbeing-data-review-0.1",
  ai_processing: "ai-processing-review-1.0",
  teacher_sharing: "teacher-sharing-review-0.1",
  notifications: "notifications-review-0.1",
  marketing: "marketing-review-0.1",
};

export function hasCurrentRequiredConsent(
  consents: ConsentState,
  versions: ConsentPolicyVersions,
): boolean {
  return hasCurrentConsentForPurpose("terms", consents, versions)
    && hasCurrentConsentForPurpose("privacy", consents, versions);
}

export function hasCurrentConsentForPurpose(
  purpose: ConsentPurpose,
  consents: ConsentState,
  versions: ConsentPolicyVersions,
): boolean {
  return consents[purpose] === true
    && versions[purpose] === CONSENT_POLICY_VERSIONS[purpose];
}

export function isCurrentLearnerSession(
  signedIn: boolean,
  currentUserId: string | null,
  expectedUserId: string,
): boolean {
  return signedIn && currentUserId === expectedUserId;
}

export const emptyConsentState: ConsentState = {
  terms: false,
  privacy: false,
  wellbeing_data: false,
  ai_processing: false,
  teacher_sharing: false,
  notifications: false,
  marketing: false,
};

export type CheckinPayload = {
  localDate: string;
  timezone: string;
  energyLevel: number | null;
  bodyStatus: "reported" | "none_now" | "uncertain" | "skipped" | "tired" | "uncomfortable" | null;
  captureType: "practice_preparation" | "standalone";
  observations: {
    regionCode: BodyRegionCode;
    state: "discomfort" | "no_discomfort" | "uncertain" | "skipped";
    level: number | null;
    note: string | null;
  }[];
  idempotencyKey: string;
};

export function toCheckinObservationRpcPayload(observations: CheckinPayload["observations"]): Json {
  return observations.map(({ regionCode, state, level, note }) => ({
    region_code: regionCode,
    state,
    level,
    note,
  }));
}

export type LearnerSnapshotData = {
  profile: LearnerProfile | null;
  consents: ConsentState;
  consentPolicyVersions: ConsentPolicyVersions;
  checkins: LearnerCheckin[];
  observations: LearnerObservation[];
};

function unwrap<T>(result: { data: T | null; error: { message: string } | null }): T | null {
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

export async function loadLearnerSnapshot(client: LearnerClient): Promise<LearnerSnapshotData> {
  const [profileResult, consentResult, consentVersionsResult, checkinResult] = await Promise.all([
    client.from("profiles").select("*").maybeSingle(),
    client.rpc("get_my_consent_state"),
    client.rpc("get_my_consent_policy_versions"),
    client
      .from("checkins")
      .select("id,user_id,local_date,local_timezone,energy_level,overall_note,body_status,capture_type,idempotency_key,created_at,updated_at")
      .order("created_at", { ascending: true })
      .limit(200),
  ]);
  const profile = unwrap(profileResult);
  const rawConsents = unwrap(consentResult) as Partial<ConsentState> | null;
  const rawConsentVersions = unwrap(consentVersionsResult) as ConsentPolicyVersions | null;
  const checkins = unwrap(checkinResult) ?? [];
  const ids = checkins.map((row) => row.id);
  const observationResult = ids.length
    ? await client
        .from("checkin_observations")
        .select("id,checkin_id,user_id,region_code,state,level,note,created_at,updated_at")
        .in("checkin_id", ids)
    : { data: [] as LearnerObservation[], error: null };

  return {
    profile,
    consents: { ...emptyConsentState, ...(rawConsents ?? {}) },
    consentPolicyVersions: Object.fromEntries(
      Object.entries(rawConsentVersions ?? {}).filter(([, version]) => typeof version === "string"),
    ) as ConsentPolicyVersions,
    checkins,
    observations: unwrap(observationResult) ?? [],
  };
}

export const ACCOUNT_DELETION_CONFIRMATION = "DELETE_MY_ACCOUNT";

export type AccountDeletionOutcome = "deleted" | "already_deleted" | "staff_account";

/** Deletes the signed-in learner's own account and every row it owns; see delete_my_account in the migrations. */
export async function deleteMyAccount(client: LearnerClient): Promise<AccountDeletionOutcome> {
  const { error } = await client.rpc("delete_my_account", { p_confirmation: ACCOUNT_DELETION_CONFIRMATION });
  if (!error) return "deleted";
  if (error.code === "P0002") return "already_deleted";
  if (error.code === "42501") return "staff_account";
  throw new Error(error.message);
}

export async function saveConsentEvent(
  client: LearnerClient,
  purpose: ConsentPurpose,
  granted: boolean,
  policyVersion: string,
  source: "onboarding" | "settings",
  idempotencyKey: string,
  channel: "web" | "ios" | "android",
) {
  return unwrap(
    await client.rpc("record_my_consent", {
      p_purpose: purpose,
      p_action: granted ? "granted" : "revoked",
      p_policy_version: policyVersion,
      p_source: source,
      p_idempotency_key: idempotencyKey,
      p_channel: channel,
    }),
  );
}

export async function saveLearnerCheckin(
  client: LearnerClient,
  payload: CheckinPayload,
  expectedUserId: string,
) {
  const rows = unwrap(
    await client.rpc("save_my_checkin_for_current_user_with_current_consent", {
      p_expected_user_id: expectedUserId,
      p_local_date: payload.localDate,
      p_local_timezone: payload.timezone,
      p_energy_level: payload.energyLevel,
      p_body_status: payload.bodyStatus,
      p_capture_type: payload.captureType,
      p_idempotency_key: payload.idempotencyKey,
      p_observations: toCheckinObservationRpcPayload(payload.observations),
    }),
  ) ?? [];
  const row = rows[0];
  if (!row) throw new Error("Supabase did not return the saved check-in.");
  return row;
}

export async function deleteLearnerCheckin(client: LearnerClient, checkinId: string) {
  return unwrap(await client.rpc("delete_my_checkin", { p_checkin_id: checkinId }));
}
