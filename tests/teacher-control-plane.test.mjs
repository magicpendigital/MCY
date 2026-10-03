import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createTeacherControlPlaneHandler, hashTeacherInviteEmail } from "../supabase/functions/_shared/teacherControlPlane.ts";
import { readBoundedJson, RequestBodyTimeoutError, RequestBodyTooLargeError } from "../supabase/functions/_shared/boundedRequest.ts";

const STAGING_URL = "https://mhumbczqrzutdnraafhs.supabase.co";
const OWNER_ID = "11111111-1111-4111-8111-111111111111";
const TEACHER_ID = "22222222-2222-4222-8222-222222222222";
const INVITE_ID = "33333333-3333-4333-8333-333333333333";
const SESSION_ID = "44444444-4444-4444-8444-444444444444";
const VERSION_ID = "55555555-5555-4555-8555-555555555555";
const IDEMPOTENCY_KEY = "66666666-6666-4666-8666-666666666666";
const VALID_TOKEN = "verified-access-token";
const HASH_SECRET = "local-test-hash-secret-with-at-least-32-characters";
const DISPLAY_NAME = "Huyền My";
const functionConfig = await readFile(new URL("../supabase/config.toml", import.meta.url), "utf8");

test("Owner, teacher and AI Edge functions explicitly require JWT verification", () => {
  assert.match(functionConfig, /^project_id\s*=\s*"mcy"\s*$/m, "local Supabase project id is present");
  const functionSections = functionConfig.split(/(?=^\[)/m);
  for (const functionName of ["owner-control-plane", "teacher-control-plane", "mcy-ai-assistant"]) {
    const section = functionSections.find(candidate => candidate.trimStart().startsWith(`[functions.${functionName}]`));
    assert.ok(section, `config.toml declares ${functionName}`);
    assert.match(section, /^verify_jwt\s*=\s*true\s*$/m, `${functionName} keeps gateway JWT verification enabled`);
  }
});

function draft(overrides = {}) {
  return {
    session_id: null,
    expected_version: null,
    locale: "vi-VN",
    title: "Thả lỏng vai nhẹ nhàng",
    summary: "Một bài tập ngắn để bắt đầu nhẹ nhàng.",
    objective: "Tạo khoảng dừng và lắng nghe cơ thể.",
    level: "Cơ bản",
    intensity: "Nhẹ",
    pace: "Chậm",
    instruction_density: "Vừa phải",
    duration_seconds: 120,
    props: [],
    space_requirement: "Một khoảng đứng yên",
    floor_contact: "Không cần nằm xuống",
    positions: ["standing"],
    learning_focus: ["gentle_movement"],
    segments: [{
      position: 1,
      start_ms: 0,
      end_ms: 120000,
      movement_name: "Xoay vai nhẹ",
      cue_text: "Di chuyển trong khoảng thoải mái của bạn.",
      stop_cue: "Dừng lại nếu thấy khó chịu.",
      breath_cue: "Thở tự nhiên.",
      variant_ref: "gentle",
    }],
    ...overrides,
  };
}

function harness(options = {}) {
  const env = new Map(Object.entries({
    SUPABASE_URL: STAGING_URL,
    MCY_TEACHER_API_ENABLED: "true",
    MCY_TEACHER_INVITES_ENABLED: "false",
    MCY_TEACHER_INVITE_HASH_SECRET: HASH_SECRET,
    ...options.env,
  }));
  const calls = [];
  const invitations = [];
  const authCalls = [];
  const profileCalls = [];
  const hashedEmails = [];
  const identity = options.identity === undefined
    ? { id: TEACHER_ID, email: "teacher@example.test", email_confirmed_at: "2026-09-01T00:00:00Z" }
    : options.identity;
  const responses = options.responses ?? {};

  const handler = createTeacherControlPlaneHandler({
    env: name => env.get(name),
    clients: authorization => {
      authCalls.push(authorization);
      return {
        user: {
          auth: { getUser: async token => ({ data: { user: token === VALID_TOKEN ? identity : null }, error: options.authError ?? null }) },
          from: table => ({
            select: columns => ({
              eq: (column, userId) => ({
                maybeSingle: async () => {
                  profileCalls.push({ table, columns, column, userId });
                  return { data: options.profile ?? { display_name: DISPLAY_NAME }, error: options.profileError ?? null };
                },
              }),
            }),
          }),
        },
        server: {
          rpc: async (name, args) => {
            calls.push({ name, args });
            const response = responses[name];
            return typeof response === "function" ? response(args) : response ?? defaultRpc(name);
          },
          auth: {
            admin: {
              inviteUserByEmail: async email => {
                invitations.push(email);
                if (options.inviteThrows) throw options.inviteThrows;
                return { data: { user: { id: "77777777-7777-4777-8777-777777777777" } }, error: options.inviteError ?? null };
              },
            },
          },
        },
      };
    },
    readJson: options.readJson ?? readBoundedJson,
    isBodyTooLarge: error => error instanceof RequestBodyTooLargeError,
    isBodyTimeout: error => error instanceof RequestBodyTimeoutError,
    hashInviteEmail: async (email, secret) => {
      assert.equal(secret, HASH_SECRET);
      hashedEmails.push(email);
      return `opaque-hmac:${email.length}`;
    },
  });
  return { handler, calls, invitations, authCalls, profileCalls, hashedEmails };
}

function defaultRpc(name) {
  if (name === "mcy_teacher_list_own_drafts") return { data: [], error: null };
  if (name === "mcy_teacher_read_own_draft") return {
    data: {
      ...draft({ session_id: SESSION_ID, expected_version: 2 }),
      version_id: VERSION_ID,
      version_no: 2,
      status: "draft",
      updated_at: "2026-10-02T00:00:00Z",
      teacher_email: "private@example.test",
    },
    error: null,
  };
  if (name === "mcy_teacher_save_own_draft") return {
    data: { session_id: SESSION_ID, version_id: VERSION_ID, version_no: 1, title: "Thả lỏng vai nhẹ nhàng", locale: "vi-VN", status: "draft", updated_at: "2026-10-02T00:00:00Z", private_note: "must not escape" },
    error: null,
  };
  if (name === "mcy_ai_get_owner_config") return { data: { enabled: false }, error: null };
  if (name === "mcy_teacher_prepare_invite") return { data: { invite_id: INVITE_ID, delivery_state: "ready" }, error: null };
  if (name === "mcy_teacher_accept_own_invite") return { data: { status: "active", role: "teacher" }, error: null };
  if (name === "mcy_teacher_invite_mark_delivered") return { data: true, error: null };
  return { data: null, error: null };
}

function request(body, options = {}) {
  const headers = new Headers(options.headers);
  if (options.token !== null) headers.set("Authorization", `Bearer ${options.token ?? VALID_TOKEN}`);
  if (body !== undefined) headers.set("Content-Type", "application/json");
  return new Request("https://function.invalid/teacher-control-plane", {
    method: options.method ?? "POST",
    headers,
    body: body === undefined ? undefined : typeof body === "string" ? body : JSON.stringify(body),
  });
}

async function jsonResponse(response) {
  return { status: response.status, body: await response.json() };
}

test("teacher API is staging-only and fail-closed before creating clients", async () => {
  const disabled = harness({ env: { MCY_TEACHER_API_ENABLED: "false" } });
  assert.deepEqual(await jsonResponse(await disabled.handler(request({ action: "list_drafts" }))), {
    status: 404, body: { error: "teacher_workspace_unavailable" },
  });
  assert.equal(disabled.authCalls.length, 0);

  const production = harness({ env: { SUPABASE_URL: "https://production.supabase.co" } });
  assert.equal((await production.handler(request({ action: "list_drafts" }))).status, 404);
  assert.equal(production.authCalls.length, 0);
});

test("methods, missing identity, and unconfirmed email are rejected before RPC", async () => {
  const methods = harness();
  assert.equal((await methods.handler(request(undefined, { method: "GET" }))).status, 405);
  assert.equal(methods.authCalls.length, 0);

  const anonymous = harness();
  assert.equal((await anonymous.handler(request({ action: "list_drafts" }, { token: null }))).status, 401);

  const unconfirmed = harness({ identity: { id: TEACHER_ID, email: "teacher@example.test", email_confirmed_at: null } });
  assert.equal((await unconfirmed.handler(request({ action: "list_drafts" }))).status, 401);
  assert.equal(unconfirmed.calls.length, 0);
});

test("teacher draft reads bind actor to the verified token and sanitize response data", async () => {
  const allowed = harness();
  const response = await jsonResponse(await allowed.handler(request({ action: "list_drafts", actor_id: OWNER_ID })));
  assert.deepEqual(response, { status: 200, body: { drafts: [] } });
  assert.deepEqual(allowed.calls, [{ name: "mcy_teacher_list_own_drafts", args: { p_actor_id: TEACHER_ID } }]);

  const denied = harness({ responses: { mcy_teacher_list_own_drafts: { data: null, error: { code: "42501", message: "role required" } } } });
  assert.deepEqual(await jsonResponse(await denied.handler(request({ action: "list_drafts" }))), {
    status: 403, body: { error: "workspace_access_required" },
  });

  const malformedResult = harness({ responses: { mcy_teacher_list_own_drafts: { data: [{ ...defaultRpc("mcy_teacher_save_own_draft").data, owner_email: "private" }], error: null } } });
  const sanitized = await jsonResponse(await malformedResult.handler(request({ action: "list_drafts" })));
  assert.equal(sanitized.status, 200);
  assert.equal("owner_email" in sanitized.body.drafts[0], false);
});

test("reading one draft requires a valid reference, binds the actor server-side, and returns only bounded draft fields", async () => {
  const allowed = harness();
  const response = await jsonResponse(await allowed.handler(request({
    action: "read_draft",
    actor_id: OWNER_ID,
    session_id: SESSION_ID,
  })));
  assert.equal(response.status, 200);
  assert.equal(response.body.draft.session_id, SESSION_ID);
  assert.equal(response.body.draft.expected_version, 2);
  assert.equal(response.body.draft.version_id, VERSION_ID);
  assert.equal(response.body.draft.version_no, 2);
  assert.equal("teacher_email" in response.body.draft, false);
  assert.deepEqual(allowed.calls, [{
    name: "mcy_teacher_read_own_draft",
    args: { p_actor_id: TEACHER_ID, p_session_id: SESSION_ID },
  }]);

  const malformed = harness();
  assert.deepEqual(await jsonResponse(await malformed.handler(request({ action: "read_draft", session_id: "not-a-uuid" }))), {
    status: 400, body: { error: "invalid_draft_reference" },
  });
  assert.deepEqual(malformed.calls, []);

  const denied = harness({ responses: {
    mcy_teacher_read_own_draft: { data: null, error: { code: "42501", message: "draft belongs to another teacher" } },
  } });
  assert.deepEqual(await jsonResponse(await denied.handler(request({ action: "read_draft", session_id: SESSION_ID }))), {
    status: 403, body: { error: "workspace_access_required" },
  });

  const malformedResult = harness({ responses: {
    mcy_teacher_read_own_draft: { data: { ...defaultRpc("mcy_teacher_read_own_draft").data, segments: [{ position: 3 }] }, error: null },
  } });
  assert.deepEqual(await jsonResponse(await malformedResult.handler(request({ action: "read_draft", session_id: SESSION_ID }))), {
    status: 503, body: { error: "teacher_service_unavailable" },
  });
});

test("draft save accepts only bounded Vietnamese draft fields and returns a public-safe receipt", async () => {
  const allowed = harness();
  const incoming = draft({ status: "published", owner_teacher_id: OWNER_ID, media_asset_id: SESSION_ID, private_notes: "secret" });
  const response = await jsonResponse(await allowed.handler(request({ action: "save_draft", actor_id: OWNER_ID, draft: incoming })));
  assert.deepEqual(response, {
    status: 200,
    body: { draft: { session_id: SESSION_ID, version_id: VERSION_ID, version_no: 1, title: "Thả lỏng vai nhẹ nhàng", locale: "vi-VN", status: "draft", updated_at: "2026-10-02T00:00:00Z" } },
  });
  const call = allowed.calls[0];
  assert.equal(call.name, "mcy_teacher_save_own_draft");
  assert.equal(call.args.p_actor_id, TEACHER_ID);
  assert.deepEqual(Object.keys(call.args.p_draft).sort(), [
    "duration_seconds", "expected_version", "floor_contact", "intensity", "instruction_density",
    "learning_focus", "level", "locale", "objective", "pace", "positions", "props", "segments",
    "session_id", "space_requirement", "summary", "title",
  ].sort());
  assert.equal("status" in call.args.p_draft, false);
  assert.equal("owner_teacher_id" in call.args.p_draft, false);
  assert.equal("media_asset_id" in call.args.p_draft, false);

  const invalidCases = [
    draft({ locale: "en-US" }),
    draft({ title: "   " }),
    draft({ duration_seconds: 3601 }),
    draft({ session_id: SESSION_ID, expected_version: null }),
    draft({ segments: [{ position: 2, start_ms: 0, end_ms: 120000 }] }),
    draft({ segments: [{ position: 1, start_ms: 0, end_ms: 120001 }] }),
    draft({ segments: Array.from({ length: 41 }, (_, index) => ({ position: index + 1, start_ms: index, end_ms: index + 1 })) }),
  ];
  for (const badDraft of invalidCases) {
    const invalid = harness();
    assert.deepEqual(await jsonResponse(await invalid.handler(request({ action: "save_draft", draft: badDraft }))), {
      status: 400, body: { error: "invalid_draft" },
    });
    assert.equal(invalid.calls.length, 0);
  }
});

test("draft version conflicts and database failures are sanitized", async () => {
  const conflict = harness({ responses: { mcy_teacher_save_own_draft: { data: null, error: { code: "40001", message: "internal row data" } } } });
  assert.deepEqual(await jsonResponse(await conflict.handler(request({ action: "save_draft", draft: draft({ session_id: SESSION_ID, expected_version: 1 }) }))), {
    status: 409, body: { error: "workspace_conflict" },
  });

  const unavailable = harness({ responses: { mcy_teacher_list_own_drafts: { data: null, error: { message: "private database detail" } } } });
  const result = await jsonResponse(await unavailable.handler(request({ action: "list_drafts" })));
  assert.deepEqual(result, { status: 503, body: { error: "teacher_service_unavailable" } });
  assert.equal(JSON.stringify(result).includes("private database detail"), false);
});

test("teacher draft save quotas return a bounded retryable response", async () => {
  const limited = harness({ responses: {
    mcy_teacher_save_own_draft: { data: null, error: { code: "54000", message: "Teacher draft write limit reached" } },
  } });
  const response = await jsonResponse(await limited.handler(request({ action: "save_draft", draft: draft() })));
  assert.deepEqual(response, { status: 429, body: { error: "draft_save_limit_reached" } });

  const hidden = harness({ responses: {
    mcy_teacher_save_own_draft: { data: null, error: { code: "54000", message: "private quota implementation detail" } },
  } });
  assert.deepEqual(await jsonResponse(await hidden.handler(request({ action: "save_draft", draft: draft() }))), {
    status: 503, body: { error: "teacher_service_unavailable" },
  });
});

test("invite acceptance requires the verified account email and its registered profile name", async () => {
  const accepted = harness();
  assert.deepEqual(await jsonResponse(await accepted.handler(request({ action: "accept_invite", public_name: "forged" }))), {
    status: 200, body: { status: "active" },
  });
  assert.deepEqual(accepted.profileCalls, [{ table: "profiles", columns: "display_name", column: "user_id", userId: TEACHER_ID }]);
  const activation = accepted.calls[0];
  assert.equal(activation.name, "mcy_teacher_accept_own_invite");
  assert.deepEqual(activation.args, { p_actor_id: TEACHER_ID, p_email_hash: "opaque-hmac:20", p_public_name: DISPLAY_NAME });
  assert.deepEqual(accepted.hashedEmails, ["teacher@example.test"]);

  const mixedCaseEmail = harness({ identity: { id: TEACHER_ID, email: "Teacher@Example.Test", email_confirmed_at: "2026-09-01T00:00:00Z" } });
  assert.equal((await mixedCaseEmail.handler(request({ action: "accept_invite" }))).status, 200);
  assert.deepEqual(mixedCaseEmail.hashedEmails, ["teacher@example.test"]);

  const missingName = harness({ profile: { display_name: null } });
  assert.deepEqual(await jsonResponse(await missingName.handler(request({ action: "accept_invite" }))), {
    status: 409, body: { error: "account_profile_required" },
  });
  assert.equal(missingName.calls.length, 0);

  const notInvited = harness({ responses: { mcy_teacher_accept_own_invite: { data: null, error: { code: "42501", message: "invitation required" } } } });
  assert.deepEqual(await jsonResponse(await notInvited.handler(request({ action: "accept_invite" }))), {
    status: 403, body: { error: "workspace_access_required" },
  });
});

test("invitation action stays separately closed and checks Owner before database or email work", async () => {
  const closed = harness();
  assert.deepEqual(await jsonResponse(await closed.handler(request({ action: "invite_teacher", email: "teacher@example.test", idempotency_key: IDEMPOTENCY_KEY }))), {
    status: 404, body: { error: "teacher_invites_unavailable" },
  });
  assert.equal(closed.calls.length, 0);
  assert.equal(closed.invitations.length, 0);

  const ownerDenied = harness({ env: { MCY_TEACHER_INVITES_ENABLED: "true" }, responses: { mcy_ai_get_owner_config: { data: null, error: { code: "42501", message: "Owner role required" } } } });
  assert.deepEqual(await jsonResponse(await ownerDenied.handler(request({ action: "invite_teacher", email: "pilot@example.test", idempotency_key: IDEMPOTENCY_KEY }))), {
    status: 403, body: { error: "owner_access_required" },
  });
  assert.equal(ownerDenied.calls.length, 1);
  assert.equal(ownerDenied.invitations.length, 0);

  const selfInvite = harness({
    env: { MCY_TEACHER_INVITES_ENABLED: "true" },
    identity: { id: OWNER_ID, email: "Owner@Example.test", email_confirmed_at: "2026-09-01T00:00:00Z" },
  });
  assert.deepEqual(await jsonResponse(await selfInvite.handler(request({ action: "invite_teacher", email: " owner@example.test ", idempotency_key: IDEMPOTENCY_KEY }))), {
    status: 400, body: { error: "invalid_invitation" },
  });
  assert.equal(selfInvite.calls.length, 0);
  assert.equal(selfInvite.invitations.length, 0);
});

test("Owner invitation hashes the normalized email, pins teacher role, and never returns the address", async () => {
  const invite = harness({
    env: { MCY_TEACHER_INVITES_ENABLED: "true" },
    identity: { id: OWNER_ID, email: "owner@example.test", email_confirmed_at: "2026-09-01T00:00:00Z" },
  });
  const rawEmail = "  Teacher+Pilot@Example.test ";
  const response = await invite.handler(request({
    action: "invite_teacher", email: rawEmail, idempotency_key: IDEMPOTENCY_KEY, role: "owner", actor_id: OWNER_ID,
  }));
  const serialized = await response.text();
  assert.equal(response.status, 200);
  assert.deepEqual(JSON.parse(serialized), { status: "sent" });
  assert.equal(serialized.includes("teacher+pilot@example.test"), false);
  assert.deepEqual(invite.invitations, ["teacher+pilot@example.test"]);
  assert.deepEqual(invite.calls.map(call => call.name), [
    "mcy_ai_get_owner_config", "mcy_teacher_prepare_invite", "mcy_teacher_invite_mark_delivered",
  ]);
  const prepared = invite.calls[1];
  assert.equal(invite.calls[0].args.p_actor_id, OWNER_ID);
  assert.equal(prepared.args.p_actor_id, OWNER_ID);
  assert.equal(prepared.args.p_email_hash, "opaque-hmac:26");
  assert.equal(prepared.args.p_actor_email_hash, "opaque-hmac:18");
  assert.deepEqual(invite.hashedEmails, ["owner@example.test", "teacher+pilot@example.test"]);
  assert.equal(prepared.args.p_idempotency_key, IDEMPOTENCY_KEY);
  assert.equal(prepared.args.p_role, "teacher");
  assert.equal(prepared.args.p_scope_type, "global");
  assert.equal(prepared.args.p_expires_in_hours, 72);
  assert.equal(JSON.stringify(prepared.args).includes("teacher+pilot@example.test"), false);

  const badEmail = harness({ env: { MCY_TEACHER_INVITES_ENABLED: "true" } });
  assert.equal((await badEmail.handler(request({ action: "invite_teacher", email: "bad\r\n@example.test", idempotency_key: IDEMPOTENCY_KEY }))).status, 400);
  assert.equal(badEmail.calls.length, 0);
});

test("returned or thrown invitation delivery errors are recorded as unconfirmed", async () => {
  for (const failure of [
    { inviteError: { message: "SMTP credential details must not escape" } },
    { inviteThrows: new Error("SMTP credential details must not escape") },
  ]) {
    const failed = harness({ env: { MCY_TEACHER_INVITES_ENABLED: "true" }, ...failure });
    const response = await failed.handler(request({ action: "invite_teacher", email: "pilot@example.test", idempotency_key: IDEMPOTENCY_KEY }));
    const serialized = await response.text();
    assert.equal(response.status, 503);
    assert.deepEqual(JSON.parse(serialized), { error: "invitation_delivery_unconfirmed" });
    assert.equal(serialized.includes("SMTP credential details"), false);
    assert.equal(failed.calls.at(-1).name, "mcy_teacher_invite_delivery_failed");
    assert.deepEqual(failed.calls.at(-1).args, { p_actor_id: TEACHER_ID, p_invite_id: INVITE_ID });
  }

  const finalizationFailed = harness({
    env: { MCY_TEACHER_INVITES_ENABLED: "true" },
    responses: { mcy_teacher_invite_mark_delivered: { data: null, error: { message: "private detail" } } },
  });
  assert.deepEqual(await jsonResponse(await finalizationFailed.handler(request({ action: "invite_teacher", email: "pilot@example.test", idempotency_key: IDEMPOTENCY_KEY }))), {
    status: 503, body: { error: "invitation_delivery_unconfirmed" },
  });
});

test("duplicate invitation requests never resend for sent, in-progress, or uncertain attempts", async () => {
  for (const state of ["sent", "in_progress", "uncertain"]) {
    const repeated = harness({
      env: { MCY_TEACHER_INVITES_ENABLED: "true" },
      responses: { mcy_teacher_prepare_invite: { data: { invite_id: INVITE_ID, delivery_state: state }, error: null } },
    });
    const result = await jsonResponse(await repeated.handler(request({ action: "invite_teacher", email: "pilot@example.test", idempotency_key: IDEMPOTENCY_KEY })));
    assert.equal(result.status, state === "sent" ? 200 : 409);
    if (state === "uncertain") assert.deepEqual(result.body, { error: "invitation_delivery_unconfirmed" });
    assert.equal(repeated.invitations.length, 0);
    assert.equal(repeated.calls.some(call => call.name === "mcy_teacher_invite_mark_delivered"), false);
  }
});

test("provider errors stay non-retryable until an explicit delivery reconciliation", async () => {
  for (const failure of [
    { inviteError: { message: "provider delivery outcome unavailable" }, failureResponse: { data: true, error: null } },
    { inviteThrows: new Error("provider delivery outcome unavailable"), failureResponse: { data: null, error: { message: "failure record unavailable" } } },
  ]) {
    let state = "ready";
    const attempt = harness({
      env: { MCY_TEACHER_INVITES_ENABLED: "true" },
      inviteError: failure.inviteError,
      inviteThrows: failure.inviteThrows,
      responses: {
        mcy_teacher_prepare_invite: () => ({ data: { invite_id: INVITE_ID, delivery_state: state }, error: null }),
        mcy_teacher_invite_delivery_failed: () => {
          state = failure.failureResponse.error ? "in_progress" : "uncertain";
          return failure.failureResponse;
        },
      },
    });

    const requestBody = { action: "invite_teacher", email: "pilot@example.test", idempotency_key: IDEMPOTENCY_KEY };
    const first = await jsonResponse(await attempt.handler(request(requestBody)));
    const repeated = await jsonResponse(await attempt.handler(request(requestBody)));

    assert.deepEqual(first, { status: 503, body: { error: "invitation_delivery_unconfirmed" } });
    assert.equal(repeated.status, 409);
    assert.equal(attempt.invitations.length, 1);
    assert.equal(attempt.calls.filter(call => call.name === "mcy_teacher_prepare_invite").length, 2);
  }
});

test("bounded, malformed, and unsupported requests fail before any control-plane RPC", async () => {
  const timedOut = harness({ readJson: async () => { throw new RequestBodyTimeoutError(); } });
  assert.equal((await timedOut.handler(request({ action: "list_drafts" }))).status, 408);

  const tooLarge = harness({ readJson: async () => { throw new RequestBodyTooLargeError(); } });
  assert.equal((await tooLarge.handler(request({ action: "list_drafts" }))).status, 413);

  const oversizedBody = harness();
  const oversizedPayload = `{"action":"list_drafts","padding":"${"x".repeat(65_536)}"}`;
  assert.equal((await oversizedBody.handler(request(oversizedPayload))).status, 413);
  assert.equal(oversizedBody.calls.length, 0);

  const malformed = harness();
  assert.equal((await malformed.handler(request("{"))).status, 400);
  assert.deepEqual(await jsonResponse(await malformed.handler(request({ action: "publish_draft" }))), {
    status: 400, body: { error: "unsupported_action" },
  });
  assert.equal(malformed.calls.length, 0);
});

test("teacher invite email HMAC is keyed, deterministic, and does not expose the address", async () => {
  const email = "teacher+pilot@example.test";
  const first = await hashTeacherInviteEmail(email, HASH_SECRET);
  const repeated = await hashTeacherInviteEmail(email, HASH_SECRET);
  const differentKey = await hashTeacherInviteEmail(email, `${HASH_SECRET}!`);
  assert.match(first, /^[0-9a-f]{64}$/);
  assert.equal(first, repeated);
  assert.notEqual(first, differentKey);
  assert.equal(first.includes(email), false);
});
