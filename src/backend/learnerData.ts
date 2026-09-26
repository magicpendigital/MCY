import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "./database.types";

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
  bodyStatus: "reported" | "none_now" | "uncertain" | "skipped" | null;
  captureType: "practice_preparation" | "standalone";
  observations: {
    regionCode: "neck" | "shoulder_left" | "shoulder_right" | "shoulder_unspecified" | "upper_back" | "lower_back";
    state: "discomfort" | "no_discomfort" | "uncertain" | "skipped";
    level: number | null;
    note: string | null;
  }[];
  idempotencyKey: string;
};

export type LearnerSnapshotData = {
  profile: LearnerProfile | null;
  consents: ConsentState;
  checkins: LearnerCheckin[];
  observations: LearnerObservation[];
};

function unwrap<T>(result: { data: T | null; error: { message: string } | null }): T | null {
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

export async function loadLearnerSnapshot(client: LearnerClient): Promise<LearnerSnapshotData> {
  const [profileResult, consentResult, checkinResult] = await Promise.all([
    client.from("profiles").select("*").maybeSingle(),
    client.rpc("get_my_consent_state"),
    client
      .from("checkins")
      .select("id,user_id,local_date,local_timezone,energy_level,overall_note,body_status,capture_type,idempotency_key,created_at,updated_at")
      .order("created_at", { ascending: true })
      .limit(200),
  ]);
  const profile = unwrap(profileResult);
  const rawConsents = unwrap(consentResult) as Partial<ConsentState> | null;
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
    checkins,
    observations: unwrap(observationResult) ?? [],
  };
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

export async function saveLearnerCheckin(client: LearnerClient, payload: CheckinPayload) {
  const rows = unwrap(
    await client.rpc("save_my_checkin", {
      p_local_date: payload.localDate,
      p_local_timezone: payload.timezone,
      p_energy_level: payload.energyLevel,
      p_body_status: payload.bodyStatus,
      p_capture_type: payload.captureType,
      p_idempotency_key: payload.idempotencyKey,
      p_observations: payload.observations as unknown as Json,
    }),
  ) ?? [];
  const row = rows[0];
  if (!row) throw new Error("Supabase did not return the saved check-in.");
  return row;
}

export async function deleteLearnerCheckin(client: LearnerClient, checkinId: string) {
  return unwrap(await client.rpc("delete_my_checkin", { p_checkin_id: checkinId }));
}
