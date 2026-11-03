import { createPracticeAssistantHandler } from "../../supabase/functions/_shared/practiceAssistant.ts";
import { readBoundedJson, RequestBodyTimeoutError, RequestBodyTooLargeError } from "../../supabase/functions/_shared/boundedRequest.ts";
export const ACTOR = "11111111-1111-4111-8111-111111111111";
export const REQUEST = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";
export const CONTEXT = { revision: "cccccccc-bbbb-4ccc-8ddd-eeeeeeeeeeee", locale: "vi-VN", minutes: 10, energy: null, intent: "Bắt nhịp", bodyStatus: "none_now", regions: [], pace: "slow", guidance: "more", floor: "avoid" };
export const SESSION = {
  id: "offline-reviewed-session", version: "a".repeat(64), locale: "vi-VN", title: "Fictional reviewed session", durationSeconds: 300, pace: "slow", guidance: "more", floorContact: false, preparation: "Offline only, no real instruction.", source: "teacher",
  review: { status: "approved", evidenceRef: "fixture-only-no-real-approval", reviewerLabel: "Fictional reviewer", reviewedAt: "2026-01-01T00:00:00Z", expiresAt: "2036-01-01T00:00:00Z" },
  eligibility: { bodyStatuses: ["none_now", "skipped", null], regionCodes: [] },
  sections: [{ id: "intro", title: "Fictional content", text: "Offline fixture, not an exercise.", image: "/assets/practice/preparation-draft/room.webp", audio: null, audioLocale: null }],
};
export function request(body = {}, token = "fictional-token") { return new Request("https://function.invalid/mcy-ai-assistant", { method: "POST", headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ action: "select_plan", requestId: REQUEST, context: CONTEXT, ...body }) }); }
export function harness(options = {}) {
  const calls = [], providerCalls = [], modelCalls = []; let reads = 0;
  const env = new Map(Object.entries({ SUPABASE_URL: "https://mhumbczqrzutdnraafhs.supabase.co", MCY_AI_ENABLE_STAGING: "true", MCY_AI_SPEND_CONTROL_APPROVED: "true", OPENROUTER_API_KEY: "fictional-provider-key", MCY_AI_PILOT_ACTORS: JSON.stringify([ACTOR]), ...options.env }));
  const handler = createPracticeAssistantHandler({
    env: k => env.get(k), now: () => Date.parse("2026-10-10T00:00:00Z"), catalog: () => options.catalog ?? [SESSION], newRequestId: () => REQUEST,
    clients: () => ({ user: { auth: { getUser: async token => ({ data: { user: token === "fictional-token" ? (options.user ?? { id: ACTOR, email_confirmed_at: "2026-01-01T00:00:00Z" }) : null }, error: null }) } }, server: { rpc: async (name, args) => {
      calls.push({ name, args });
      if (options.rpc) { const result = await options.rpc(name, args); if (result) return result; }
      if (name === "mcy_ai_read_admission_state") return { data: options.states?.[reads++] ?? { enabled: true, consent_current: true, version_no: 1 }, error: null };
      if (name === "mcy_ai_begin_request") return { data: { enabled: true, version_no: 1, model_id: "provider/model", temperature: .3, max_output_tokens: 320 }, error: null };
      if (name === "mcy_ai_finish_request") return { data: options.finish ?? true, error: null };
      return { data: null, error: { message: "unsupported" } };
    } } }),
    readModels: async key => { modelCalls.push(key); if (options.onModels) await options.onModels(); return [{ id: "provider/model" }]; },
    fetchProvider: async (url, init) => { providerCalls.push({ url, body: JSON.parse(init.body) }); if (options.onProvider) await options.onProvider(); return Response.json({ model: "provider/model", usage: { prompt_tokens: 80, completion_tokens: 20 }, choices: [{ message: { content: JSON.stringify(options.decision ?? { status: "selected", sessionId: SESSION.id }) } }] }); },
    readJson: readBoundedJson, isBodyTooLarge: e => e instanceof RequestBodyTooLargeError, isBodyTimeout: e => e instanceof RequestBodyTimeoutError,
  }); return { handler, calls, providerCalls, modelCalls, env };
}
