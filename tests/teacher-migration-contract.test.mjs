import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const migration = await readFile(
  new URL("../supabase/migrations/20261127031613_teacher_control_plane_rpcs.sql", import.meta.url),
  "utf8",
);

const rpcSignatures = {
  mcy_teacher_prepare_invite: "uuid, text, text, uuid, text, text, integer",
  mcy_teacher_invite_mark_delivered: "uuid, uuid",
  mcy_teacher_invite_delivery_failed: "uuid, uuid",
  mcy_teacher_invite_mark_existing_account: "uuid, uuid",
  mcy_teacher_accept_own_invite: "uuid, text, text",
  mcy_teacher_list_own_drafts: "uuid",
  mcy_teacher_read_own_draft: "uuid, uuid",
  mcy_teacher_save_own_draft: "uuid, jsonb",
};

test("teacher RPC migration defines only the eight server-side control-plane entry points", () => {
  assert.equal((migration.match(/create or replace function public\.mcy_teacher_/g) ?? []).length, 8);
  for (const [name, signature] of Object.entries(rpcSignatures)) {
    const start = migration.indexOf(`create or replace function public.${name}(`);
    assert.notEqual(start, -1, `${name} exists`);
    const end = migration.indexOf("$$;", start);
    assert.notEqual(end, -1, `${name} body closes`);
    const definition = migration.slice(start, end + 3);
    assert.match(definition, /security definer/i, `${name} runs with controlled definer privileges`);
    assert.match(definition, /set search_path\s*=\s*''/i, `${name} pins an empty search_path`);
    assert.match(
      migration,
      new RegExp(`revoke all on function public\\.${name}\\(${signature.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\) from public, anon, authenticated;`, "i"),
      `${name} is not executable by browser roles`,
    );
    assert.match(
      migration,
      new RegExp(`grant execute on function public\\.${name}\\(${signature.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\) to service_role;`, "i"),
      `${name} is callable by the server role`,
    );
  }
  assert.doesNotMatch(migration, /grant\s+usage\s+on\s+schema\s+private\s+to\s+service_role/i);
  assert.doesNotMatch(migration, /grant\s+all\s+on\s+(?:all\s+tables|table)\s+in\s+schema\s+private/i);
});

test("invitation RPCs bind Owner identity, self-invites, idempotency, and uncertain delivery", () => {
  assert.match(migration, /workspace_invites_actor_idempotency_idx/i);
  assert.match(migration, /p_email_hash\s*=\s*p_actor_email_hash/i);
  assert.match(migration, /delivery_state\s*=\s*'in_progress'/i);
  assert.match(migration, /'delivery_state',\s*'ready'/i);
  assert.match(migration, /set delivery_state\s*=\s*'uncertain'/i);
  assert.match(migration, /set delivery_state\s*=\s*'sent'/i);
  assert.match(migration, /i\.email_hash\s*=\s*p_email_hash[\s\S]*?i\.delivery_state\s*=\s*'sent'/i);
  assert.match(migration, /pg_catalog\.jsonb_build_object\('role',\s*'teacher',\s*'scope_type',\s*'global'/i);
});

test("teacher activation and draft RPCs remain invite-bound, actor-owned, versioned, and draft-only", () => {
  assert.match(migration, /u\.email_confirmed_at/i);
  assert.match(migration, /p\.display_name/i);
  assert.match(migration, /i\.accepted_by\s*=\s*p_actor_id/i);
  assert.match(migration, /r\.role\s*=\s*'teacher'/i);
  assert.match(migration, /s\.owner_teacher_id\s*=\s*p_actor_id/i);
  assert.match(migration, /v\.status\s*=\s*'draft'/i);
  assert.match(migration, /expected_version/i);
  assert.match(migration, /'status',\s*'draft'/i);
  assert.match(migration, /teacher\.draft\.saved/i);
  assert.match(migration, /pg_advisory_xact_lock\([\s\S]*?hashtextextended\('mcy:teacher-draft-save:'/i);
  assert.match(migration, /from private\.audit_events e[\s\S]*?e\.action = 'teacher\.draft\.saved'[\s\S]*?e\.occurred_at >= pg_catalog\.now\(\) - interval '24 hours'/i);
  assert.match(migration, /if v_recent_save_count >= 20 then[\s\S]*?errcode = '54000'[\s\S]*?Teacher draft write limit reached/i);
  assert.doesNotMatch(migration, /create or replace function public\.mcy_teacher_[^(]+\([^)]*publish/i);
});

test("unapplied teacher draft business conflicts use non-retryable PT409", () => {
  assert.doesNotMatch(migration, /(?:errcode\s*=|raise\s+sqlstate)\s*'40001'/i);
  assert.equal((migration.match(/errcode\s*=\s*'PT409'/g) ?? []).length, 2);
  assert.match(migration, /if not found or v_current\.status <> 'draft' then\s*raise exception using errcode = 'PT409'/);
  assert.match(migration, /if v_current\.version_no <> v_expected_version then\s*raise exception using errcode = 'PT409'/);
});
