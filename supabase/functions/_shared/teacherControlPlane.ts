import {
  createResendSender,
  TEACHER_INVITE_EMAIL_SUBJECT,
  TEACHER_INVITE_REDIRECT_URL,
  teacherInviteEmailHtml,
  teacherInviteEmailText,
  type TeacherInviteEmailSender,
  validSenderAddress,
} from "./teacherInviteEmail.ts";

export type TeacherIdentity = {
  id?: string | null;
  email?: string | null;
  email_confirmed_at?: string | null;
};

type RpcResult = { data: unknown; error: { code?: string; message?: string } | null };

export type TeacherControlPlaneClients = {
  user: {
    auth: {
      getUser(token: string): Promise<{ data: { user: TeacherIdentity | null }; error: unknown | null }>;
    };
    from(table: "profiles"): {
      select(columns: "display_name"): {
        eq(column: "user_id", value: string): {
          maybeSingle(): Promise<{ data: { display_name?: string | null } | null; error: unknown | null }>;
        };
      };
    };
  };
  server: {
    rpc(name: string, args: Record<string, unknown>): PromiseLike<RpcResult>;
    auth: {
      admin: {
        inviteUserByEmail(email: string, options?: { redirectTo?: string }): Promise<{ data: unknown; error: unknown | null }>;
      };
    };
  };
};

export type TeacherControlPlaneDependencies = {
  env(name: string): string | undefined;
  clients(authorization: string): TeacherControlPlaneClients;
  readJson(request: Request, maxBytes: number): Promise<unknown>;
  isBodyTooLarge(error: unknown): boolean;
  isBodyTimeout(error: unknown): boolean;
  hashInviteEmail(email: string, secret: string): Promise<string>;
  /** Builds the sender for the existing-account instructions email; defaults to the Resend HTTP API. */
  emailSender?(apiKey: string): TeacherInviteEmailSender;
};

const STAGING_SUPABASE_URL = "https://mhumbczqrzutdnraafhs.supabase.co";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "Vary": "Origin",
};

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function cleanText(value: unknown, maximum: number, required = false): string | null {
  if (typeof value !== "string") return required ? null : "";
  const text = value.trim();
  if ((required && !text) || text.length > maximum || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(text)) return null;
  return text;
}

function stringList(value: unknown, maximumCount: number, maximumItemLength: number): string[] | null {
  if (!Array.isArray(value) || value.length > maximumCount) return null;
  const result: string[] = [];
  for (const item of value) {
    const normalized = cleanText(item, maximumItemLength, true);
    if (normalized === null) return null;
    result.push(normalized);
  }
  return result;
}

function safeDraft(value: unknown): Record<string, unknown> | null {
  if (!isRecord(value)) return null;
  const sessionId = value.session_id;
  const expectedVersion = value.expected_version;
  if (sessionId !== null && (typeof sessionId !== "string" || !UUID_PATTERN.test(sessionId))) return null;
  if (expectedVersion !== null && (!Number.isInteger(expectedVersion) || Number(expectedVersion) < 1)) return null;
  if ((sessionId === null) !== (expectedVersion === null)) return null;
  if (value.locale !== "vi-VN") return null;

  const title = cleanText(value.title, 120, true);
  const summary = cleanText(value.summary, 1000);
  const objective = cleanText(value.objective, 1000);
  const level = cleanText(value.level, 80);
  const intensity = cleanText(value.intensity, 80);
  const pace = cleanText(value.pace, 80);
  const instructionDensity = cleanText(value.instruction_density, 80);
  const spaceRequirement = cleanText(value.space_requirement, 240);
  const floorContact = cleanText(value.floor_contact, 240);
  const props = stringList(value.props, 12, 80);
  const positions = stringList(value.positions, 8, 80);
  const learningFocus = stringList(value.learning_focus, 12, 120);
  const durationSeconds = value.duration_seconds;
  const rawSegments = value.segments;
  if (title === null || summary === null || objective === null || level === null || intensity === null
    || pace === null || instructionDensity === null || spaceRequirement === null || floorContact === null
    || !props || !positions || !learningFocus || !Number.isInteger(durationSeconds)
    || Number(durationSeconds) < 1 || Number(durationSeconds) > 3600
    || !Array.isArray(rawSegments) || rawSegments.length > 40) return null;

  const segments: Record<string, unknown>[] = [];
  let previousEnd = 0;
  for (const item of rawSegments) {
    if (!isRecord(item)) return null;
    const { position, start_ms: startMs, end_ms: endMs } = item;
    const movementName = cleanText(item.movement_name, 120);
    const cueText = cleanText(item.cue_text, 600);
    const stopCue = cleanText(item.stop_cue, 400);
    const breathCue = cleanText(item.breath_cue, 400);
    const variantRef = cleanText(item.variant_ref, 100);
    if (!Number.isInteger(position) || Number(position) !== segments.length + 1
      || !Number.isInteger(startMs) || !Number.isInteger(endMs)
      || Number(startMs) < previousEnd || Number(endMs) <= Number(startMs)
      || Number(endMs) > Number(durationSeconds) * 1000
      || movementName === null || cueText === null || stopCue === null || breathCue === null || variantRef === null) return null;
    previousEnd = Number(endMs);
    segments.push({
      position: Number(position), start_ms: Number(startMs), end_ms: Number(endMs),
      movement_name: movementName, cue_text: cueText, stop_cue: stopCue,
      breath_cue: breathCue, variant_ref: variantRef,
    });
  }

  return {
    session_id: sessionId,
    expected_version: expectedVersion,
    locale: "vi-VN",
    title,
    summary,
    objective,
    level,
    intensity,
    pace,
    instruction_density: instructionDensity,
    duration_seconds: Number(durationSeconds),
    props,
    space_requirement: spaceRequirement,
    floor_contact: floorContact,
    positions,
    learning_focus: learningFocus,
    segments,
  };
}

function safeDraftResult(value: unknown): Record<string, unknown> | null {
  if (!isRecord(value) || typeof value.session_id !== "string" || !UUID_PATTERN.test(value.session_id)
    || typeof value.version_id !== "string" || !UUID_PATTERN.test(value.version_id)
    || !Number.isInteger(value.version_no) || Number(value.version_no) < 1
    || value.locale !== "vi-VN" || value.status !== "draft"
    || typeof value.updated_at !== "string" || !Number.isFinite(Date.parse(value.updated_at))) return null;
  const title = cleanText(value.title, 120, true);
  if (title === null) return null;
  return {
    session_id: value.session_id,
    version_id: value.version_id,
    version_no: value.version_no,
    title,
    locale: "vi-VN",
    status: "draft",
    updated_at: value.updated_at,
  };
}

function safeDraftDocument(value: unknown): Record<string, unknown> | null {
  if (!isRecord(value) || typeof value.version_id !== "string" || !UUID_PATTERN.test(value.version_id)
    || !Number.isInteger(value.version_no) || Number(value.version_no) < 1
    || value.status !== "draft" || typeof value.updated_at !== "string" || !Number.isFinite(Date.parse(value.updated_at))) return null;
  const draft = safeDraft({ ...value, expected_version: value.version_no });
  if (!draft || typeof draft.session_id !== "string") return null;
  return { ...draft, version_id: value.version_id, version_no: value.version_no, status: "draft", updated_at: value.updated_at };
}

function mapRpcFailure(error: { code?: string; message?: string } | null): Response {
  if (error?.code === "40001") return json(503, { error: "teacher_service_unavailable" });
  if (error?.code === "54000" && /teacher draft write limit reached/i.test(error.message ?? "")) {
    return json(429, { error: "draft_save_limit_reached" });
  }
  if (error?.code === "42501"
    || (!error?.code && /role required|owner access|invitation required/i.test(error?.message ?? ""))) {
    return json(403, { error: "workspace_access_required" });
  }
  if (error?.code === "PT409" || error?.code === "23505"
    || (!error?.code && /changed; reload|already processed/i.test(error?.message ?? ""))) {
    return json(409, { error: "workspace_conflict" });
  }
  if (error?.code === "P0002") return json(404, { error: "draft_not_found" });
  return json(503, { error: "teacher_service_unavailable" });
}

function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (email.length > 254 || /[\r\n\u0000-\u001f\u007f]/.test(email)
    || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) return null;
  return email;
}

export async function hashTeacherInviteEmail(email: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signed = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`mcy:teacher-invite:v1:${email}`));
  return Array.from(new Uint8Array(signed), byte => byte.toString(16).padStart(2, "0")).join("");
}

/** The Auth provider refuses to invite an address that already has an account. */
function isExistingAccountRefusal(error: unknown): boolean {
  if (!isRecord(error)) return false;
  return error.code === "email_exists" || error.code === "user_already_exists";
}

function identityHasConfirmedEmail(identity: TeacherIdentity | null): identity is TeacherIdentity & { id: string; email: string; email_confirmed_at: string } {
  return Boolean(identity?.id && UUID_PATTERN.test(identity.id) && identity.email?.trim()
    && identity.email_confirmed_at);
}

export function createTeacherControlPlaneHandler(dependencies: TeacherControlPlaneDependencies) {
  return async (request: Request): Promise<Response> => {
    if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
    if (request.method !== "POST") return json(405, { error: "method_not_allowed" });

    const authorization = request.headers.get("Authorization") ?? "";
    const token = authorization.match(/^Bearer\s+(.+)$/i)?.[1];
    if (!token) return json(401, { error: "authentication_required" });
    if (dependencies.env("SUPABASE_URL")?.replace(/\/$/, "") !== STAGING_SUPABASE_URL
      || dependencies.env("MCY_TEACHER_API_ENABLED") !== "true") {
      return json(404, { error: "teacher_workspace_unavailable" });
    }

    try {
      const { user, server } = dependencies.clients(authorization);
      const { data: authData, error: authError } = await user.auth.getUser(token);
      if (authError || !identityHasConfirmedEmail(authData.user)) {
        return json(401, { error: "authentication_required" });
      }
      const actorId = authData.user.id;

      let body: unknown;
      try {
        body = await dependencies.readJson(request, 65_536);
      } catch (error) {
        if (dependencies.isBodyTooLarge(error)) return json(413, { error: "request_too_large" });
        if (dependencies.isBodyTimeout(error)) return json(408, { error: "request_timeout" });
        return json(400, { error: "invalid_request" });
      }
      if (!isRecord(body) || typeof body.action !== "string") return json(400, { error: "invalid_request" });

      if (body.action === "list_drafts") {
        const { data, error } = await server.rpc("mcy_teacher_list_own_drafts", { p_actor_id: actorId });
        if (error) return mapRpcFailure(error);
        if (!Array.isArray(data) || data.length > 100) return json(503, { error: "teacher_service_unavailable" });
        const drafts = data.map(safeDraftResult);
        if (drafts.some(draft => draft === null)) return json(503, { error: "teacher_service_unavailable" });
        return json(200, { drafts });
      }

      if (body.action === "read_draft") {
        if (typeof body.session_id !== "string" || !UUID_PATTERN.test(body.session_id)) {
          return json(400, { error: "invalid_draft_reference" });
        }
        const { data, error } = await server.rpc("mcy_teacher_read_own_draft", {
          p_actor_id: actorId,
          p_session_id: body.session_id,
        });
        if (error) return mapRpcFailure(error);
        const draft = safeDraftDocument(data);
        return draft ? json(200, { draft }) : json(503, { error: "teacher_service_unavailable" });
      }

      if (body.action === "save_draft") {
        const draft = safeDraft(body.draft);
        if (!draft) return json(400, { error: "invalid_draft" });
        const { data, error } = await server.rpc("mcy_teacher_save_own_draft", {
          p_actor_id: actorId,
          p_draft: draft,
        });
        if (error) return mapRpcFailure(error);
        const saved = safeDraftResult(data);
        return saved ? json(200, { draft: saved }) : json(503, { error: "teacher_service_unavailable" });
      }

      if (body.action === "accept_invite") {
        const emailHashSecret = dependencies.env("MCY_TEACHER_INVITE_HASH_SECRET");
        if (!emailHashSecret || emailHashSecret.length < 32) return json(503, { error: "teacher_service_unavailable" });
        const { data: profileData, error: profileError } = await user.from("profiles")
          .select("display_name").eq("user_id", actorId).maybeSingle();
        if (profileError) return json(503, { error: "teacher_service_unavailable" });
        const displayName = cleanText(profileData?.display_name, 80, true);
        if (!displayName) return json(409, { error: "account_profile_required" });
        const normalizedIdentityEmail = normalizeEmail(authData.user.email);
        if (!normalizedIdentityEmail) return json(401, { error: "authentication_required" });
        const emailHash = await dependencies.hashInviteEmail(normalizedIdentityEmail, emailHashSecret);
        const { data, error } = await server.rpc("mcy_teacher_accept_own_invite", {
          p_actor_id: actorId,
          p_email_hash: emailHash,
          p_public_name: displayName,
        });
        if (error) return mapRpcFailure(error);
        if (!isRecord(data) || data.status !== "active") return json(403, { error: "workspace_access_required" });
        return json(200, { status: "active" });
      }

      if (body.action === "invite_teacher") {
        if (dependencies.env("MCY_TEACHER_INVITES_ENABLED") !== "true") {
          return json(404, { error: "teacher_invites_unavailable" });
        }
        const email = normalizeEmail(body.email);
        if (!email || typeof body.idempotency_key !== "string" || !UUID_PATTERN.test(body.idempotency_key)) {
          return json(400, { error: "invalid_invitation" });
        }
        const actorEmail = normalizeEmail(authData.user.email);
        if (!actorEmail || email === actorEmail) return json(400, { error: "invalid_invitation" });
        const emailHashSecret = dependencies.env("MCY_TEACHER_INVITE_HASH_SECRET");
        if (!emailHashSecret || emailHashSecret.length < 32) return json(503, { error: "teacher_service_unavailable" });

        // Reuse the server-side Owner authorization RPC; never trust client metadata or an actor id in the body.
        const ownerCheck = await server.rpc("mcy_ai_get_owner_config", { p_actor_id: actorId });
        if (ownerCheck.error || !ownerCheck.data) return json(403, { error: "owner_access_required" });

        // Which kind of account the address has decides the delivery path. Owner and
        // staff accounts are refused before any invitation row or email exists.
        const kindResult = await server.rpc("mcy_teacher_invite_account_kind", { p_actor_id: actorId, p_email: email });
        if (kindResult.error) return mapRpcFailure(kindResult.error);
        const accountKind = kindResult.data;
        if (accountKind !== "none" && accountKind !== "learner" && accountKind !== "staff") {
          return json(503, { error: "teacher_service_unavailable" });
        }
        if (accountKind === "staff") return json(200, { status: "existing_staff_account" });

        const actorEmailHash = await dependencies.hashInviteEmail(actorEmail, emailHashSecret);
        const emailHash = await dependencies.hashInviteEmail(email, emailHashSecret);
        const prepared = await server.rpc("mcy_teacher_prepare_invite", {
          p_actor_id: actorId,
          p_email_hash: emailHash,
          p_actor_email_hash: actorEmailHash,
          p_idempotency_key: body.idempotency_key,
          p_role: "teacher",
          p_scope_type: "global",
          p_expires_in_hours: 72,
        });
        if (prepared.error) return mapRpcFailure(prepared.error);
        if (!isRecord(prepared.data) || typeof prepared.data.invite_id !== "string"
          || !UUID_PATTERN.test(prepared.data.invite_id)
          || !["ready", "sent", "in_progress", "uncertain"].includes(String(prepared.data.delivery_state))) {
          return json(503, { error: "teacher_service_unavailable" });
        }
        if (prepared.data.delivery_state === "sent") return json(200, { status: "already_sent" });
        if (prepared.data.delivery_state === "in_progress") return json(409, { error: "invitation_in_progress" });
        if (prepared.data.delivery_state === "uncertain") return json(409, { error: "invitation_delivery_unconfirmed" });

        const inviteId = prepared.data.invite_id;
        const recordUnconfirmed = async () => {
          await Promise.resolve(server.rpc("mcy_teacher_invite_delivery_failed", {
            p_actor_id: actorId,
            p_invite_id: inviteId,
          })).catch(() => undefined);
          // A provider error does not prove that no email was accepted. Keep this
          // idempotency attempt non-retryable until an owner reconciles delivery.
          return json(503, { error: "invitation_delivery_unconfirmed" });
        };

        let existingAccount = accountKind === "learner";
        if (!existingAccount) {
          let deliveryFailed = false;
          try {
            const delivery = await server.auth.admin.inviteUserByEmail(email, { redirectTo: TEACHER_INVITE_REDIRECT_URL });
            existingAccount = isExistingAccountRefusal(delivery.error);
            deliveryFailed = Boolean(delivery.error) && !existingAccount;
          } catch {
            deliveryFailed = true;
          }
          if (deliveryFailed) return recordUnconfirmed();
        }

        if (existingAccount) {
          const resendKey = dependencies.env("RESEND_API_KEY")?.trim();
          const from = validSenderAddress(dependencies.env("MCY_TEACHER_INVITE_FROM"));
          if (!resendKey || !from) {
            // Without a configured sender, keep the P0 behaviour: no email goes out,
            // the invitation stays bound to the address hash, and the Owner tells the
            // teacher directly how to open the teacher workspace.
            const marked = await server.rpc("mcy_teacher_invite_mark_existing_account", {
              p_actor_id: actorId,
              p_invite_id: inviteId,
            });
            if (marked.error || marked.data !== true) return json(503, { error: "invitation_delivery_unconfirmed" });
            return json(200, { status: "existing_account" });
          }
          const send = (dependencies.emailSender ?? createResendSender)(resendKey);
          let accepted = false;
          try {
            accepted = await send({
              from,
              to: email,
              subject: TEACHER_INVITE_EMAIL_SUBJECT,
              html: teacherInviteEmailHtml(),
              text: teacherInviteEmailText(),
              idempotencyKey: `mcy-teacher-invite-${inviteId}`,
            });
          } catch {
            accepted = false;
          }
          if (!accepted) return recordUnconfirmed();
          const emailed = await server.rpc("mcy_teacher_invite_mark_existing_account_emailed", {
            p_actor_id: actorId,
            p_invite_id: inviteId,
          });
          if (emailed.error || emailed.data !== true) return json(503, { error: "invitation_delivery_unconfirmed" });
          return json(200, { status: "sent_existing_account" });
        }
        const finalized = await server.rpc("mcy_teacher_invite_mark_delivered", {
          p_actor_id: actorId,
          p_invite_id: prepared.data.invite_id,
        });
        if (finalized.error || finalized.data !== true) return json(503, { error: "invitation_delivery_unconfirmed" });
        return json(200, { status: "sent" });
      }

      return json(400, { error: "unsupported_action" });
    } catch {
      return json(503, { error: "teacher_service_unavailable" });
    }
  };
}
